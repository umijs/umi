interface IConfig {
  [key: string]: any;
}

export default function(defaultConfig: IConfig, ...configs: IConfig[]) {
  const ret = { ...defaultConfig };
  configs.forEach(config => {
    Object.keys(config).forEach(key => {
      const val = config[key];
      if (typeof val === 'function') {
        ret[key] = val(ret[key]);
      } else {
        ret[key] = val;
      }
    });
  });
  return ret;
}
