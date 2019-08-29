/**
 * \/\/ => /
 */
export const trimSlash = (path: string): string => path.replace(/\/\//, '/');

/**
 * Windows:
 * C:/Users/jcl => ['C:', 'Users', 'jcl']
 *
 * OS X || Linux:
 * /Users/jcl/ => ['/', 'Users', 'jcl']
 * / => ['/']
 */
export const path2Arr = (path: string): string[] => {
  const splitArr = path === '/' ? ['/'] : path.split('/');
  return splitArr.map((p, i) => (i === 0 && !p ? '/' : p)).filter(p => p);
};

/**
 * Windows:
 * ['C:', 'Users', 'jcl'] => C:/Users/jcl
 *
 * OS X || Linux:
 * ['/', 'Users', 'jcl'] => /Users/jcl/
 */
export const arr2Path = (arr: string[]): string => {
  return trimSlash(arr.filter(path => path).join('/'));
};
