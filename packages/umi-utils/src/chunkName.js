import winPath from './winPath';

function stripFirstSlash(path) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  } else {
    return path;
  }
}

export default function chunkName(cwd, path) {
  return stripFirstSlash(winPath(path).replace(winPath(cwd), ''))
    .replace(/\//g, '__')
    .replace(/^src__/, '')
    .replace(/^pages__/, 'p__')
    .replace(/^page__/, 'p__');
}
