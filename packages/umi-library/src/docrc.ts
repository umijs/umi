// TODO: 改成 plugin 实现，这样用户使用 docrc 配置时就能共用了

export default {
  modifyBundlerConfig(config, dev, args) {
    if (process.env.COMPRESS === 'none') {
      config.optimization.minimize = false;
    }
    return config;
  },
};
