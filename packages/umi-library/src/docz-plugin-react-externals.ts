import { createPlugin } from 'docz-core';

export default function() {
  return createPlugin({
    onCreateWebpackChain(config) {
      config.externals({
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
      });
      return config;
    },
    setConfig(config) {
      config.htmlContext.head = config.htmlContext.head || ({} as any);
      config.htmlContext.head.scripts = config.htmlContext.head.scripts || [];
      config.htmlContext.head.scripts.push({
        src: 'https://unpkg.com/react@16.8.6/umd/react.production.min.js',
      });
      config.htmlContext.head.scripts.push({
        src:
          'https://unpkg.com/react-dom@16.8.6/umd/react-dom.production.min.js',
      });
      return config;
    },
  });
}
