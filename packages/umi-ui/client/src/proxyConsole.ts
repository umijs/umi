export default (enable: boolean = false) => {
  if (enable) {
    // proxy Console in
    const proxyConsole = new Proxy(window.console, {
      get: (target, key: keyof Console) => {
        // escape console.error throw error
        if (key === 'error') return target[key];
        // localStorage set debugMini=umiui & debug=umiui* to debug mini all
        const storageDebug = window.localStorage.getItem('debugMini');
        if (storageDebug && storageDebug.indexOf('umiui') > -1) {
          return target[key];
        }
        return () => {};
      },
    });

    // @ts-ignore
    window.console = proxyConsole;
  }
};
