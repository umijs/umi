import * as React from 'react';
import Loadable from './loadable';

interface ILoadableOptions {
  loading?: Function;
  loader?: Function;
}

export default function (opts: any): any {
  let loadableFn = Loadable;
  let loadableOptions: ILoadableOptions = {
    loading: ({ error, isLoading }: { error: Error; isLoading: boolean }) => {
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
  // eg: dynamic(() => import('../hello-world'))
  if (typeof opts === 'function') {
    loadableOptions.loader = opts;
    // Support for having first argument being options,
    // eg: dynamic({loader: import('../hello-world')})
  } else if (typeof opts === 'object') {
    loadableOptions = { ...loadableOptions, ...opts };
  } else {
    throw new Error(`Unexpect arguments ${opts}`);
  }

  // Support for passing options,
  // eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
  // loadableOptions = { ...loadableOptions, ...options };

  return loadableFn(loadableOptions);
}
