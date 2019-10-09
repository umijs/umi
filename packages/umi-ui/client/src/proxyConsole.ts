export default (enable: boolean = false) => {
  if (enable) {
    // proxy Console in
    const proxyConsole = new Proxy(window.console, {
      get: (target, key: keyof Console) => {
        // escape console.error throw error
        if (key === 'error') return target[key];
        // debug=umiui:console
        const storageDebug = window.localStorage.getItem('debug');
        if (storageDebug && storageDebug.indexOf('umiui:console') > -1) {
          return target[key];
        }
        return () => {};
      },
    });

    // @ts-ignore
    window.console = proxyConsole;
  }
};
