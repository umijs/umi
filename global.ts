// Redirect /zh-CN to /
if (location.pathname.startsWith('/zh-CN')) {
  location.pathname = '/';
}
