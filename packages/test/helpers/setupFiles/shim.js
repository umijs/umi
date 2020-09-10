require('core-js/stable');
require('regenerator-runtime/runtime');

if (typeof window !== 'undefined') {
  require('whatwg-fetch');
}

// https://github.com/jsdom/jsdom/issues/1843
window.document.childNodes.length === 0;
window.someCoolAPI = () => {
  /* ... */
};
window.alert = (msg) => {
  console.log(msg);
};
window.matchMedia = () => ({});
window.scrollTo = () => {};
