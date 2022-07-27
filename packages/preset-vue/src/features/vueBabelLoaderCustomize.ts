import type { PartialConfig } from '@umijs/bundler-utils/compiled/@babel/core';
import { parse } from 'querystring';

export default function vueBabelLoaderCustomize() {
  return {
    config(config: PartialConfig) {
      const context = this as any;
      if (config.options.filename) {
        if (/\.vue$/.test(config.options.filename)) {
          const query = parse(context.resourceQuery.slice(1));
          // 仅 template 执行区分
          if (query.type === 'template') {
            config.options.filename = `${config.options.filename}?type=${query.type}`;
          }
        }
      }
      return config.options;
    },
  };
}
