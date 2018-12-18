import { toLower } from 'lodash';
import upperCamelCase from 'uppercamelcase';

function stripFirstSlash(path) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  }
}

export default function(path) {
  const ROUTE_PATH = toLower(path);
  const PAGE_NAME = ROUTE_PATH.split('/').slice(-1)[0];

  return new Map([
    ['ROUTE_PATH', ROUTE_PATH],
    ['BLOCK_NAME', stripFirstSlash(ROUTE_PATH).replace(/\//g, '-')],
    // PAGE_NAME_UPPER_CAMEL_CASE 需要在 PAGE_NAME 之前，
    // 因为先替换 PAGE_NAME 会修改 PAGE_NAME_UPPER_CAMEL_CASE 里的 PAGE_NAME
    ['PAGE_NAME_UPPER_CAMEL_CASE', upperCamelCase(PAGE_NAME)],
    ['PAGE_NAME', PAGE_NAME],
  ]);
}
