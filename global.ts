// Redirect /zh-CN to /
if (location.pathname.startsWith('/zh-CN')) {
  location.href = `https://v3.umijs.org${location.pathname}`;
}
