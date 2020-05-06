import pathToRegexp from 'path-to-regexp';
import { MenuDataItem } from '../types';
import getFlatMenu from '../getFlatMenus/getFlatMenus';

/**
 * a-b-c
 * [
 *  "a",
 *  "a-b",
 *  "a-b-c"
 * ]
 * @param menuKey
 */
export const genKeysToArray = (menuKey: string) => {
  const keys = menuKey.split('-');
  const keyArray: string[] = [];
  keys.forEach((key, index) => {
    if (index === 0) {
      keyArray.push(key);
      return;
    }
    keyArray.push(keys.slice(0, index + 1).join('-'));
  });
  return keyArray;
};

export const getMenuMatches = (
  flatMenuKeys: string[] = [],
  path: string,
): string | undefined =>
  flatMenuKeys
    .filter((item) => {
      if (item === '/' && path === '/') {
        return true;
      }
      if (item !== '/' && item) {
        // /a
        if (pathToRegexp(`${item}`).test(path)) {
          return true;
        }
        // /a/b/b
        if (pathToRegexp(`${item}(.*)`).test(path)) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => {
      // 如果完全匹配放到最后面
      if (a === path) {
        return 10;
      }
      if (b === path) {
        return -10;
      }
      return a.substr(1).split('/').length - b.substr(1).split('/').length;
    })
    .pop();

/**
 * 获取当前的选中菜单列表
 * @param pathname
 * @param menuData
 * @returns MenuDataItem[]
 */
export const getMatchMenu = (
  pathname: string,
  menuData: MenuDataItem[],
): MenuDataItem[] => {
  const flatMenus = getFlatMenu(menuData);
  const flatMenuKeys = Object.keys(flatMenus);
  const menuPathKey = getMenuMatches(flatMenuKeys, pathname || '/');
  if (!menuPathKey) {
    return [];
  }
  const menuItem = flatMenus[menuPathKey] || { parentKeys: '', key: '' };

  const parentItems = (menuItem.parentKeys || [])
    .map((key) => flatMenus[key])
    .filter((item) => item);

  if (menuItem.key) {
    parentItems.push(menuItem);
  }
  return parentItems;
};

export default getMatchMenu;
