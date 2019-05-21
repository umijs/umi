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
      const flag = process.env.NODE_ENV === 'development' ? 'development' : 'production.min';
      config.htmlContext.head = config.htmlContext.head || ({} as any);
      config.htmlContext.head.scripts = config.htmlContext.head.scripts || [];
      config.htmlContext.head.scripts.push({
        src: `https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.${flag}.js`,
      });
      config.htmlContext.head.scripts.push({
        src: `https://gw.alipayobjects.com/os/lib/react-dom/16.8.6/umd/react-dom.${flag}.js`,
      });
      return config;
    },
  });
}
