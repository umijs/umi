export default function vueBabelLoaderCustomize() {
  return {
    config(config: any) {
      if (/\.vue$/.test(config.options.filename)) {
        config.options.filename = `${config.options.filename}${
          (this as any).resourceQuery
        }`;
      }
      return config.options;
    },
  };
}
