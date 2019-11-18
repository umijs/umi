export default () => ({
  // recommend gtag rather than ga
  // https://developers.google.com/analytics/devguides/collection/gtagjs/migration?hl=zh-cn
  gtag: window.gtag || (() => ({})),
  // Tracert Object will include whatever Bigfish or Umi
  // because Umi and Bigfish use it to log error stack, Bigfish use it to logPv
  Tracert: new Proxy(window.Tracert || {}, {
    get: (target, key) => {
      if (key in target && window.g_bigfish) {
        return target[key];
      }
      return () => {};
    },
  }),
});
