export default function(pathname) {
  let ret = null;
  pathname = pathname.replace(/\.html?$/, '');
  if (pathname.slice(-1) === '/') {
    ret = `${pathname.slice(0, -1)}/index.js`;
  } else {
    ret = `${pathname}.js`;
  }
  // strip the start slash
  ret = ret.slice(1);
  return ret;
}
