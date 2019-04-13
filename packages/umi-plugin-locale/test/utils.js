export const mockLocalStorage = () => {
  // eslint-disable-next-line wrap-iife
  const localStorageMock = (function() {
    let store = {};

    return {
      // Reference: greasemonkey_api_test.js@chromium
      getItem(key) {
        if (key in store) {
          return store[key];
        }
        return null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      clear() {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // eslint-disable-next-line no-restricted-globals
  Object.defineProperty(location, 'reload', {
    value: () => {
      window.g_lang = window.localStorage.getItem('umi_locale');
    },
  });
};
