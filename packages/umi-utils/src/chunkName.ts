import winPath from './winPath';

function stripFirstSlash(path: string): string {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  } else {
    return path;
  }
}

/**
 * Get Relative Path
 * @param cwd
 * @param path
 */
export default function chunkName(cwd: string, path: string): string {
  return stripFirstSlash(winPath(path).replace(winPath(cwd), ''))
    .replace(/\//g, '__')
    .replace(/^src__/, '')
    .replace(/^pages__/, 'p__')
    .replace(/^page__/, 'p__');
}
