import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { lodash, Mustache, NpmClientEnum, winPath } from 'umi/plugin-utils';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

// 获取所有 icons
const antIconsPath = winPath(
  dirname(require.resolve('@ant-design/icons/package')),
);

const getAllIcons = () => {
  // 读取 index.d.ts
  const iconTypePath = join(antIconsPath, './lib/icons/index.d.ts');
  const iconTypeContent = readFileSync(iconTypePath, 'utf-8');

  // 截取 default as ${iconName}, 然后获取 iconName 转换为 map
  return [...iconTypeContent.matchAll(/default as (\w+)/g)].reduce(
    (memo: Record<string, boolean>, cur) => {
      memo[cur[1]] = true;
      return memo;
    },
    {},
  );
};

const ANT_PRO_COMPONENT = '@ant-design/pro-components';

export default (api: IApi) => {
  let antdVersion = '4.0.0';
  try {
    const pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'antd',
      }) || dirname(require.resolve('antd/package.json'));
    antdVersion = require(`${pkgPath}/package.json`).version;
  } catch (e) {}

  const packageName = api.pkg.name || 'plugin-layout';

  const isAntd5 = antdVersion.startsWith('5');
  const layoutFile = isAntd5 ? 'Layout.css' : 'Layout.less';

  api.describe({
    key: 'layout',
    config: {
      schema({ zod }) {
        return zod.record(zod.any());
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  /**
   * 优先去找 '@alipay/tech-ui'，内部项目优先
   */
  const depList = [
    '@alipay/tech-ui',
    ANT_PRO_COMPONENT,
    '@ant-design/pro-layout',
  ];

  const pkgHasDep = depList.find((dep) => {
    const { pkg } = api;
    if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
      return true;
    }
    return false;
  });

  const getPkgPath = () => {
    // 如果techui， components 和 layout 至少有一个在，找到他们的地址
    if (
      pkgHasDep &&
      existsSync(join(api.cwd, 'node_modules', pkgHasDep, 'package.json'))
    ) {
      return join(api.cwd, 'node_modules', pkgHasDep);
    }
    const cwd = process.cwd();
    // support APP_ROOT
    if (
      pkgHasDep &&
      api.cwd !== cwd &&
      existsSync(join(cwd, 'node_modules', pkgHasDep, 'package.json'))
    ) {
      return join(cwd, 'node_modules', pkgHasDep);
    }
    // 如果项目中没有去找插件依赖的
    return dirname(require.resolve(`${ANT_PRO_COMPONENT}/package.json`));
  };

  const pkgPath = winPath(getPkgPath());
  const resolvedPkgPath = pkgPath || ANT_PRO_COMPONENT;

  api.modifyAppData((memo) => {
    const version = require(`${pkgPath}/package.json`).version;
    memo.pluginLayout = {
      pkgPath,
      version,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    // 只在没有自行依赖 @ant-design/pro-components 或 @alipay/tech-ui 时
    // 才使用插件中提供的 @ant-design/pro-components
    if (!pkgHasDep) {
      // 寻找到什么就用什么，在 '@alipay/tech-ui','@ant-design/pro-components','@ant-design/pro-layout' 中寻找
      const name = require(`${pkgPath}/package.json`).name;
      memo.alias[name] = pkgPath;
    }
    return memo;
  });

  api.onGenerateFiles(() => {
    // use absolute path to types references in `npm/yarn` will cause case problems.
    // https://github.com/umijs/umi/discussions/10947
    // https://github.com/umijs/umi/discussions/11570
    const isFlattedDepsDir = [NpmClientEnum.npm, NpmClientEnum.yarn].includes(
      api.appData.npmClient,
    );
    const PKG_TYPE_REFERENCE = `
/// <reference types="${
      isFlattedDepsDir ? ANT_PRO_COMPONENT : resolvedPkgPath
    }" />
${isFlattedDepsDir ? '/// <reference types="antd" />' : ''}
`.trimStart();

    const hasInitialStatePlugin = api.config.initialState;
    // Layout.tsx
    api.writeTmpFile({
      path: 'Layout.tsx',
      content: `
${PKG_TYPE_REFERENCE}
import { Link, useLocation, useNavigate, Outlet, useAppData, useRouteData, matchRoutes } from 'umi';
import type { IRoute } from 'umi';
import React, { useMemo } from 'react';
import {
  ProLayout,
} from "${resolvedPkgPath}";
import './${layoutFile}';
import Logo from './Logo';
import Exception from './Exception';
import { getRightRenderContent } from './rightRender';
${
  hasInitialStatePlugin
    ? `import { useModel } from '@@/plugin-model';`
    : 'const useModel = null;'
}
${
  api.config.access
    ? `
import { useAccessMarkedRoutes } from '@@/plugin-access';
   `.trim()
    : 'const useAccessMarkedRoutes = (r) => r;'
}
${
  api.config.locale
    ? `
import { useIntl } from '@@/plugin-locale';
    `.trim()
    : ''
}

// 过滤出需要显示的路由, 这里的filterFn 指 不希望显示的层级
const filterRoutes = (routes: IRoute[], filterFn: (route: IRoute) => boolean) => {
  if (routes.length === 0) {
    return []
  }

  let newRoutes = []
  for (const route of routes) {
    const newRoute = {...route };
    if (filterFn(route)) {
      if (Array.isArray(newRoute.routes)) {
        newRoutes.push(...filterRoutes(newRoute.routes, filterFn))
      }
    } else {
      if (Array.isArray(newRoute.children)) {
        newRoute.children = filterRoutes(newRoute.children, filterFn);
        newRoute.routes = newRoute.children;
      }
      newRoutes.push(newRoute);
    }
  }

  return newRoutes;
}

// 格式化路由 处理因 wrapper 导致的 菜单 path 不一致
const mapRoutes = (routes: IRoute[]) => {
  if (routes.length === 0) {
    return []
  }
  return routes.map(route => {
    // 需要 copy 一份, 否则会污染原始数据
    const newRoute = {...route}
    if (route.originPath) {
      newRoute.path = route.originPath
    }

    if (Array.isArray(route.routes)) {
      newRoute.routes = mapRoutes(route.routes);
    }

    if (Array.isArray(route.children)) {
      newRoute.children = mapRoutes(route.children);
    }

    return newRoute
  })
}

export default (props: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientRoutes, pluginManager } = useAppData();
  const initialInfo = (useModel && useModel('@@initialState')) || {
    initialState: undefined,
    loading: false,
    setInitialState: null,
  };
  const { initialState, loading, setInitialState } = initialInfo;
  const userConfig = ${JSON.stringify(api.config.layout, null, 2)};
${
  api.config.locale
    ? `
const { formatMessage } = useIntl();
`.trim()
    : 'const formatMessage = undefined;'
}
  const runtimeConfig = pluginManager.applyPlugins({
    key: 'layout',
    type: 'modify',
    initialValue: {
      ...initialInfo
    },
  });


  // 现在的 layout 及 wrapper 实现是通过父路由的形式实现的, 会导致路由数据多了冗余层级, proLayout 消费时, 无法正确展示菜单, 这里对冗余数据进行过滤操作
  const newRoutes = filterRoutes(clientRoutes.filter(route => route.id === 'ant-design-pro-layout'), (route) => {
    return (!!route.isLayout && route.id !== 'ant-design-pro-layout') || !!route.isWrapper;
  })
  const [route] = useAccessMarkedRoutes(mapRoutes(newRoutes));

  const matchedRoute = useMemo(() => matchRoutes(route.children, location.pathname)?.pop?.()?.route, [location.pathname]);

  return (
    <ProLayout
      route={route}
      location={location}
      title={userConfig.title || '${packageName}'}
      navTheme="dark"
      siderWidth={256}
      onMenuHeaderClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate('/');
      }}
      formatMessage={userConfig.formatMessage || formatMessage}
      menu={{ locale: userConfig.locale }}
      logo={Logo}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children) {
          return defaultDom;
        }
        if (menuItemProps.path && location.pathname !== menuItemProps.path) {
          return (
            // handle wildcard route path, for example /slave/* from qiankun
            <Link to={menuItemProps.path.replace('/*', '')} target={menuItemProps.target}>
              {defaultDom}
            </Link>
          );
        }
        return defaultDom;
      }}
      itemRender={(route, _, routes) => {
        const { breadcrumbName, title, path } = route;
        const label = title || breadcrumbName
        const last = routes[routes.length - 1]
        if (last) {
          if (last.path === path || last.linkPath === path) {
            return <span>{label}</span>;
          }
        }
        return <Link to={path}>{label}</Link>;
      }}
      disableContentMargin
      fixSiderbar
      fixedHeader
      {...runtimeConfig}
      rightContentRender={
        runtimeConfig.rightContentRender !== false &&
        ((layoutProps) => {
          const dom = getRightRenderContent({
            runtimeConfig,
            loading,
            initialState,
            setInitialState,
          });
          if (runtimeConfig.rightContentRender) {
            return runtimeConfig.rightContentRender(layoutProps, dom, {
              // BREAK CHANGE userConfig > runtimeConfig
              userConfig,
              runtimeConfig,
              loading,
              initialState,
              setInitialState,
            });
          }
          return dom;
        })
      }
    >
      <Exception
        route={matchedRoute}
        noFound={runtimeConfig?.noFound}
        notFound={runtimeConfig?.notFound}
        unAccessible={runtimeConfig?.unAccessible}
        noAccessible={runtimeConfig?.noAccessible}
      >
        {runtimeConfig.childrenRender
          ? runtimeConfig.childrenRender(<Outlet />, props)
          : <Outlet />
        }
      </Exception>
    </ProLayout>
  );
}
      `,
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `export type TempType = string`,
    });
    // 写入类型, RunTimeLayoutConfig 是 app.tsx 中 layout 配置的类型
    // 对于动态 layout 配置很有用
    api.writeTmpFile({
      path: 'types.d.ts',
      content: `
    ${PKG_TYPE_REFERENCE}
    import type { ProLayoutProps, HeaderProps } from "${resolvedPkgPath}";
    ${
      hasInitialStatePlugin
        ? `import type InitialStateType from '@@/plugin-initialState/@@initialState';
           type InitDataType = ReturnType<typeof InitialStateType>;
        `
        : 'type InitDataType = any;'
    }

    import type { IConfigFromPlugins } from '@@/core/pluginConfig';

    export type RunTimeLayoutConfig = (initData: InitDataType) => Omit<
      ProLayoutProps,
      'rightContentRender'
    > & {
      childrenRender?: (dom: JSX.Element, props: ProLayoutProps) => React.ReactNode;
      unAccessible?: JSX.Element;
      noFound?: JSX.Element;
      logout?: (initialState: InitDataType['initialState']) => Promise<void> | void;
      rightContentRender?: ((
        headerProps: HeaderProps,
        dom: JSX.Element,
        props: {
          userConfig: IConfigFromPlugins['layout'];
          runtimeConfig: RunTimeLayoutConfig;
          loading: InitDataType['loading'];
          initialState: InitDataType['initialState'];
          setInitialState: InitDataType['setInitialState'];
        },
      ) => JSX.Element) | false;
      rightRender?: (
        initialState: InitDataType['initialState'],
        setInitialState: InitDataType['setInitialState'],
        runtimeConfig: RunTimeLayoutConfig,
      ) => JSX.Element;
    };
    `.trimStart(),
    });
    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { RunTimeLayoutConfig } from './types.d';
export interface IRuntimeConfig {
  layout?: RunTimeLayoutConfig
}
      `,
    });
    const allIcons: Record<string, boolean> = getAllIcons();
    const iconsMap = Object.keys(api.appData.routes).reduce<
      Record<string, boolean>
    >((memo, id) => {
      const { icon } = api.appData.routes[id];
      if (icon) {
        const upperIcon = lodash.upperFirst(lodash.camelCase(icon));
        // @ts-ignore
        if (allIcons[upperIcon]) {
          memo[upperIcon] = true;
        }
        // @ts-ignore
        if (allIcons[`${upperIcon}Outlined`]) {
          memo[`${upperIcon}Outlined`] = true;
        }
      }
      return memo;
    }, {});
    const icons = Object.keys(iconsMap);
    api.writeTmpFile({
      path: 'icons.tsx',
      content: `
${icons
  .map((icon) => {
    return `import ${icon} from '${antIconsPath}/es/icons/${icon}';`;
  })
  .join('\n')}
export default { ${icons.join(', ')} };
      `,
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import icons from './icons';

function formatIcon(name: string) {
  return name
    .replace(name[0], name[0].toUpperCase())
    .replace(/-(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
}

export function patchRoutes({ routes }) {
  Object.keys(routes).forEach(key => {
    const { icon } = routes[key];
    if (icon && typeof icon === 'string') {
      const upperIcon = formatIcon(icon);
      if (icons[upperIcon] || icons[upperIcon + 'Outlined']) {
        routes[key].icon = React.createElement(icons[upperIcon] || icons[upperIcon + 'Outlined']);
      }
    }
  });
}
      `,
    });

    const rightRenderContent = `
import React from 'react';
import { Avatar, version, Dropdown, Menu, Spin } from 'antd';
import { LogoutOutlined } from '${antIconsPath}';
{{#Locale}}
import { SelectLang } from '@@/plugin-locale';
{{/Locale}}

export function getRightRenderContent (opts: {
   runtimeConfig: any,
   loading: boolean,
   initialState: any,
   setInitialState: any,
 }) {
  if (opts.runtimeConfig.rightRender) {
    return opts.runtimeConfig.rightRender(
      opts.initialState,
      opts.setInitialState,
      opts.runtimeConfig,
    );
  }

  const showAvatar = opts.initialState?.avatar || opts.initialState?.name || opts.runtimeConfig.logout;
  const disableAvatarImg = opts.initialState?.avatar === false;
  const nameClassName = disableAvatarImg ? 'umi-plugin-layout-name umi-plugin-layout-hide-avatar-img' : 'umi-plugin-layout-name';
  const avatar =
    showAvatar ? (
      <span className="umi-plugin-layout-action">
        {!disableAvatarImg ?
          (
            <Avatar
              size="small"
              className="umi-plugin-layout-avatar"
              src={
                opts.initialState?.avatar ||
                "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
              }
              alt="avatar"
            />
          ) : null}
        <span className={nameClassName}>{opts.initialState?.name}</span>
      </span>
    ) : null;


  if (opts.loading) {
    return (
      <div className="umi-plugin-layout-right">
        <Spin size="small" style={ { marginLeft: 8, marginRight: 8 } } />
      </div>
    );
  }

  // 如果没有打开Locale，并且头像为空就取消掉这个返回的内容
  {{^Locale}}
    if(!avatar) return null;
  {{/Locale}}

  const langMenu = {
    className: "umi-plugin-layout-menu",
    selectedKeys: [],
    items: [
      {
        key: "logout",
        label: (
          <>
            <LogoutOutlined />
            退出登录
          </>
        ),
        onClick: () => {
          opts?.runtimeConfig?.logout?.(opts.initialState);
        },
      },
    ],
  };
  // antd@5 和  4.24 之后推荐使用 menu，性能更好
  let dropdownProps;
  if (version.startsWith("5.") || version.startsWith("4.24.")) {
    dropdownProps = { menu: langMenu };
  } else if (version.startsWith("3.")) {
    dropdownProps = {
      overlay: (
        <Menu>
          {langMenu.items.map((item) => (
            <Menu.Item key={item.key} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      ),
    };
  } else { // 需要 antd 4.20.0 以上版本
    dropdownProps = { overlay: <Menu {...langMenu} /> };
  }



  return (
    <div className="umi-plugin-layout-right anticon">
      {opts.runtimeConfig.logout ? (
        <Dropdown {...dropdownProps} overlayClassName="umi-plugin-layout-container">
          {avatar}
        </Dropdown>
      ) : (
        avatar
      )}
{{#Locale}}
      <SelectLang />
{{/Locale}}
    </div>
  );
}
      `;

    const Locale = api.isPluginEnable('locale');

    // rightRender.tsx
    api.writeTmpFile({
      path: 'rightRender.tsx',
      content: Mustache.render(rightRenderContent, {
        Locale,
      }),
    });

    // Layout.less
    api.writeTmpFile({
      path: layoutFile,
      content: `
${
  // antd@5里面没有这个样式了
  isAntd5 ? '' : "@import '~antd/es/style/themes/default.less';"
}
@media screen and (max-width: 480px) {
  /* 在小屏幕的时候可以有更好的体验 */
  .umi-plugin-layout-container {
    width: 100% !important;
  }
  .umi-plugin-layout-container > * {
    border-radius: 0 !important;
  }
}
.umi-plugin-layout-menu .anticon {
  margin-right: 8px;
}
.umi-plugin-layout-menu .ant-dropdown-menu-item {
  min-width: 160px;
}
.umi-plugin-layout-right {
  display: flex !important;
  float: right;
  height: 100%;
  margin-left: auto;
  overflow: hidden;
}
.umi-plugin-layout-right .umi-plugin-layout-action {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.umi-plugin-layout-right .umi-plugin-layout-action > i {
  color: rgba(255, 255, 255, 0.85);
  vertical-align: middle;
}
.umi-plugin-layout-right .umi-plugin-layout-action:hover {
  background: rgba(0, 0, 0, 0.025);
}
.umi-plugin-layout-right .umi-plugin-layout-action.opened {
  background: rgba(0, 0, 0, 0.025);
}
.umi-plugin-layout-right .umi-plugin-layout-search {
  padding: 0 12px;
}
.umi-plugin-layout-right .umi-plugin-layout-search:hover {
  background: transparent;
}
.umi-plugin-layout-name {
  margin-left: 8px;
}
.umi-plugin-layout-name.umi-plugin-layout-hide-avatar-img {
  margin-left: 0;
}
`,
    });

    // Logo.tsx
    api.writeTmpFile({
      path: 'Logo.tsx',
      content: `
import React from 'react';

const LogoIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 200 200"
    >
      <defs>
        <linearGradient
          id="linearGradient-1"
          x1="62.102%"
          x2="108.197%"
          y1="0%"
          y2="37.864%"
        >
          <stop offset="0%" stopColor="#4285EB"></stop>
          <stop offset="100%" stopColor="#2EC7FF"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-2"
          x1="69.644%"
          x2="54.043%"
          y1="0%"
          y2="108.457%"
        >
          <stop offset="0%" stopColor="#29CDFF"></stop>
          <stop offset="37.86%" stopColor="#148EFF"></stop>
          <stop offset="100%" stopColor="#0A60FF"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-3"
          x1="69.691%"
          x2="16.723%"
          y1="-12.974%"
          y2="117.391%"
        >
          <stop offset="0%" stopColor="#FA816E"></stop>
          <stop offset="41.473%" stopColor="#F74A5C"></stop>
          <stop offset="100%" stopColor="#F51D2C"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-4"
          x1="68.128%"
          x2="30.44%"
          y1="-35.691%"
          y2="114.943%"
        >
          <stop offset="0%" stopColor="#FA8E7D"></stop>
          <stop offset="51.264%" stopColor="#F74A5C"></stop>
          <stop offset="100%" stopColor="#F51D2C"></stop>
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g transform="translate(-20 -20)">
          <g transform="translate(20 20)">
            <g>
              <g fillRule="nonzero">
                <g>
                  <path
                    fill="url(#linearGradient-1)"
                    d="M91.588 4.177L4.18 91.513a11.981 11.981 0 000 16.974l87.408 87.336a12.005 12.005 0 0016.989 0l36.648-36.618c4.209-4.205 4.209-11.023 0-15.228-4.208-4.205-11.031-4.205-15.24 0l-27.783 27.76c-1.17 1.169-2.945 1.169-4.114 0l-69.802-69.744c-1.17-1.169-1.17-2.942 0-4.11l69.802-69.745c1.17-1.169 2.944-1.169 4.114 0l27.783 27.76c4.209 4.205 11.032 4.205 15.24 0 4.209-4.205 4.209-11.022 0-15.227L108.581 4.056c-4.719-4.594-12.312-4.557-16.993.12z"
                  ></path>
                  <path
                    fill="url(#linearGradient-2)"
                    d="M91.588 4.177L4.18 91.513a11.981 11.981 0 000 16.974l87.408 87.336a12.005 12.005 0 0016.989 0l36.648-36.618c4.209-4.205 4.209-11.023 0-15.228-4.208-4.205-11.031-4.205-15.24 0l-27.783 27.76c-1.17 1.169-2.945 1.169-4.114 0l-69.802-69.744c-1.17-1.169-1.17-2.942 0-4.11l69.802-69.745c2.912-2.51 7.664-7.596 14.642-8.786 5.186-.883 10.855 1.062 17.009 5.837L108.58 4.056c-4.719-4.594-12.312-4.557-16.993.12z"
                  ></path>
                </g>
                <path
                  fill="url(#linearGradient-3)"
                  d="M153.686 135.855c4.208 4.205 11.031 4.205 15.24 0l27.034-27.012c4.7-4.696 4.7-12.28 0-16.974l-27.27-27.15c-4.218-4.2-11.043-4.195-15.254.013-4.209 4.205-4.209 11.022 0 15.227l18.418 18.403c1.17 1.169 1.17 2.943 0 4.111l-18.168 18.154c-4.209 4.205-4.209 11.023 0 15.228z"
                ></path>
              </g>
              <ellipse
                cx="100.519"
                cy="100.437"
                fill="url(#linearGradient-4)"
                rx="23.6"
                ry="23.581"
              ></ellipse>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default LogoIcon;
      `,
    });

    api.writeTmpFile({
      path: 'Exception.tsx',
      content: `
import React from 'react';
import { history, type IRoute } from 'umi';
import { Result, Button } from 'antd';

const Exception: React.FC<{
  children: React.ReactNode;
  route?: IRoute;
  notFound?: React.ReactNode;
  noAccessible?: React.ReactNode;
  unAccessible?: React.ReactNode;
  noFound?: React.ReactNode;
}> = (props) => (
  // render custom 404
  (!props.route && (props.noFound || props.notFound)) ||
  // render custom 403
  (props.route?.unaccessible && (props.unAccessible || props.noAccessible)) ||
  // render default exception
  ((!props.route || props.route?.unaccessible) && (
    <Result
      status={props.route ? '403' : '404'}
      title={props.route ? '403' : '404'}
      subTitle={props.route ? '抱歉，你无权访问该页面' : '抱歉，你访问的页面不存在'}
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          返回首页
        </Button>
      }
    />
  )) ||
  // normal render
  props.children
);

export default Exception;
`,
    });
  });

  api.addLayouts(() => {
    return [
      {
        id: 'ant-design-pro-layout',
        file: withTmpPath({ api, path: 'Layout.tsx' }),
        test: (route: any) => {
          return route.layout !== false;
        },
      },
    ];
  });

  api.addRuntimePluginKey(() => ['layout']);

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });
};
