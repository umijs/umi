import React from 'react';
import Loadable from 'react-loadable';

// Thanks to next.js
// ref: https://github.com/zeit/next.js/blob/canary/lib/dynamic.js
export default function(dynamicOptions, options) {
  let loadableFn = Loadable;
  let loadableOptions = {
    loading: ({ error, isLoading }) => {
      if (process.env.NODE_ENV === 'development') {
        if (isLoading) {
          return <p>loading...</p>;
        }
        if (error) {
          return (
            <p>
              {error.message}
              <br />
              {error.stack}
            </p>
          );
        }
      }
      return <p>loading...</p>;
    },
  };

  // Support for direct import(),
  // eg: dynamic(import('../hello-world'))
  if (typeof dynamicOptions.then === 'function') {
    loadableOptions.loader = () => dynamicOptions;
    // Support for having first argument being options,
    // eg: dynamic({loader: import('../hello-world')})
  } else if (typeof dynamicOptions === 'object') {
    loadableOptions = { ...loadableOptions, ...dynamicOptions };
  }

  // Support for passing options,
  // eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
  loadableOptions = { ...loadableOptions, ...options };

  // Support for `render` when using a mapping,
  // eg: `dynamic({ modules: () => {return {HelloWorld: import('../hello-world')}, render(props, loaded) {} } })
  if (dynamicOptions.render) {
    loadableOptions.render = (loaded, props) => dynamicOptions.render(props, loaded);
  }

  // Support for `modules` when using a mapping,
  // eg: `dynamic({ modules: () => {return {HelloWorld: import('../hello-world')}, render(props, loaded) {} } })
  if (dynamicOptions.modules) {
    loadableFn = Loadable.Map;
    const loadModules = {};
    const modules = dynamicOptions.modules();
    Object.keys(modules).forEach(key => {
      const value = modules[key];
      if (typeof value.then === 'function') {
        loadModules[key] = () => value.then(mod => mod.default || mod);
        return;
      }
      loadModules[key] = value;
    });
    loadableOptions.loader = loadModules;
  }

  return loadableFn(loadableOptions);
}
