import React from 'react';

declare namespace LoadableExport {
  interface ILoadable {
    <P = {}>(opts: {
      render?: (loaded: Record<string, any>, props: P) => any;
      [key: string]: any;
    }): React.ComponentClass<P> & ILoadable;
    Map<P = {}>(opts: {
      render?: (loaded: Record<string, any>, props: P) => any;
      [key: string]: any;
    }): React.ComponentType<P>;
    preloadAll(): Promise<any>;
    preloadReady(): Promise<any>;
    preload(): Promise<any>;
  }
}

// eslint-disable-next-line no-redeclare
declare const LoadableExport: LoadableExport.ILoadable;

export = LoadableExport;
