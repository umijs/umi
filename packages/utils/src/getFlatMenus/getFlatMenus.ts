import { MenuDataItem } from '../types';

/**
 * 获取打平的 menuData
 * 已 path 为 key
 * @param menuData
 */
export const getFlatMenus = (
  menuData: MenuDataItem[] = [],
): {
  [key: string]: MenuDataItem;
} => {
  let menus = {};
  menuData.forEach(item => {
    if (!item || item.hideInMenu) {
      return;
    }
    menus[item.path || '/'] = item;
    if (item.children && !item.hideChildrenInMenu) {
      menus = { ...menus, ...getFlatMenus(item.children) };
    }
  });
  return menus;
};

export default getFlatMenus;
