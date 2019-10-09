import { toLower, camelCase } from 'lodash';
import upperCamelCase from 'uppercamelcase';

function stripFirstSlash(path) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  }
  return path;
}

export default path => {
  let ROUTE_PATH = path;
  if (path.includes('-') || path.includes('_')) {
    ROUTE_PATH = toLower(path);
  }
  const PAGE_NAME =
    ROUTE_PATH.split('/')
      .filter(str => str)
      .pop() || 'NewPage';
  const BLOCK_NAME = stripFirstSlash(ROUTE_PATH).replace(/\//g, 'And');

  return new Map([
    ['ROUTE_PATH', toLower(ROUTE_PATH)],
    // [XXX][_UPPER]_CAMEL_CASE 需要在 XXX 之前，
    // 因为先替换 XXX 会修改 [XXX][_UPPER]_CAMEL_CASE 里的 XXX
    ['BLOCK_NAME_CAMEL_CASE', camelCase(BLOCK_NAME)],
    ['BLOCK_NAME', toLower(BLOCK_NAME)],
    ['PAGE_NAME_UPPER_CAMEL_CASE', upperCamelCase(PAGE_NAME)],
    ['PAGE_NAME', toLower(PAGE_NAME)],
  ]);
};
