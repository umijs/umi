import { parse } from 'querystring';

export default function vueBabelLoaderCustomize() {
  return {
    config(config: any) {
      const context = this as any;
      if (/\.vue$/.test(config.options.filename)) {
        const query = parse(context.resourceQuery.slice(1));
        config.options.filename = `${config.options.filename}?type=${query.type}`;
      }
      return config.options;
    },
  };
}
