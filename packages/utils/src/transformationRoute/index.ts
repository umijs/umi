import isEqual from 'lodash.isequal';
import memoizeOne from 'memoize-one';
import hash from 'hash.js';
import { MenuDataItem, Route, MessageDescriptor } from '../types';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const isBrowser = () =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  !isNode;

export function guid() {
  return 'xxxxxxxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getKeyByPath = (item: MenuDataItem) => {
  const { path, name } = item;
  if (path && path !== '/') {
    return path;
  }
  // 如果有name, 使用name
  if (name) {
    return name;
  }
  // 如果还是没有，用对象的hash 生成一个
  try {
    return hash
      .sha256()
      .update(JSON.stringify(item))
      .digest('hex');
  } catch (error) {
    // dom some thing
  }
  // 要是还是不行，返回一个随机值
  return guid();
};

/**
 * 获取locale，增加了一个功能，如果 locale = false，将不使用国际化
 * @param item
 * @param parentName
 */
const getItemLocaleName = (
  item: MenuDataItem,
  parentName: string,
): string | false => {
  const { name, locale } = item;

  // 如果配置了 locale 并且 locale 为 false或 ""
  if ('locale' in item && !locale) {
    return '';
  }
  return item.locale || `${parentName}.${name}`;
};

interface FormatterProps {
  data: MenuDataItem[];
  locale?: boolean;
  formatMessage?: (data: { id: string; defaultMessage?: string }) => string;
  parentName?: string;
  [key: string]: any;
}

/**
 * 如果不是 / 开头的和父节点做一下合并
 * 如果是 / 开头的不作任何处理
 * 如果是 url 也直接返回
 * @param path
 * @param parentPath
 */
const mergePath = (path: string = '', parentPath: string = '/') => {
  if ((path || parentPath).startsWith('/')) {
    return path;
  }
  if (isUrl(path)) {
    return path;
  }
  return `/${parentPath}/${path}`.replace(/\/\//g, '/').replace(/\/\//g, '/');
};

/**
 *
 * @param props
 * @param parent
 */
function formatter(
  props: FormatterProps,
  parent: Partial<MenuDataItem> = { path: '/' },
): MenuDataItem[] {
  const { data, formatMessage, parentName } = props;
  if (!data) {
    return [];
  }
  return data
    .filter(item => {
      if (!item) return false;
      if (item.routes || item.children) return true;
      if (item.name && item.path) return true;
      return false;
    })
    .map((item = { path: '/' }) => {
      if (!item.name) return item;
      const path = mergePath(item.path, parent ? parent.path : '/');
      const { name } = item;
      const locale = getItemLocaleName(item, parentName || 'menu');

      // if enableMenuLocale use item.name,
      // close menu international
      const localeName =
        locale !== false && formatMessage
          ? formatMessage({ id: locale, defaultMessage: name })
          : name;
      const { parentKeys = [] } = parent;

      const finallyItem: MenuDataItem = {
        ...parent,
        ...item,
        path,
        name: localeName,
        locale,
        key: item.key || getKeyByPath(item),
        routes: null,
        parentKeys: [...parentKeys, parent.key || '/'],
      };

      if (item.routes || item.children) {
        const children = formatter(
          {
            ...props,
            data: item.routes || item.children,
            parentName: locale || '',
          },
          finallyItem,
        );
        // Reduce memory usage
        finallyItem.children = children;
      }
      return finallyItem;
    });
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * 删除 hideInMenu 和 item.name 不存在的
 */
const defaultFilterMenuData = (menuData: MenuDataItem[] = []): MenuDataItem[] =>
  menuData
    .filter(
      (item: MenuDataItem) =>
        item && item.name && !item.hideInMenu && !item.redirect,
    )
    .map((item: MenuDataItem) => {
      if (
        item.children &&
        Array.isArray(item.children) &&
        !item.hideChildrenInMenu &&
        item.children.some((child: MenuDataItem) => child && !!child.name)
      ) {
        const children = defaultFilterMenuData(item.children);
        if (children.length) return { ...item, children };
      }
      return { ...item, children: undefined };
    })
    .filter(item => item);

/**
 * 获取面包屑映射
 * @param MenuDataItem[] menuData 菜单配置
 */
const getBreadcrumbNameMap = (
  menuData: MenuDataItem[],
): Map<string, MenuDataItem> => {
  // Map is used to ensure the order of keys
  const routerMap = new Map<string, MenuDataItem>();
  const flattenMenuData = (data: MenuDataItem[], parent?: MenuDataItem) => {
    data.forEach(menuItem => {
      if (!menuItem) {
        return;
      }
      if (menuItem && menuItem.children) {
        flattenMenuData(menuItem.children, menuItem);
      }
      // Reduce memory usage
      const path = mergePath(menuItem.path, parent ? parent.path : '/');
      routerMap.set(path, menuItem);
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(
  getBreadcrumbNameMap,
  isEqual,
);

/**
 * @param routes 路由配置
 * @param locale 是否使用国际化
 * @param formatMessage 国际化的程序
 * @returns { breadcrumb, menuData}
 */
const transformationRoute = (
  routes: Route[],
  locale: false,
  formatMessage?: (message: MessageDescriptor) => string,
): {
  breadcrumb: Map<string, MenuDataItem>;
  menuData: MenuDataItem[];
} => {
  const originalMenuData = memoizeOneFormatter({
    data: routes,
    formatMessage,
    locale,
  });
  const menuData = defaultFilterMenuData(originalMenuData);
  // Map type used for internal logic
  const breadcrumb = memoizeOneGetBreadcrumbNameMap(originalMenuData);

  return { breadcrumb, menuData };
};

export default transformationRoute;
