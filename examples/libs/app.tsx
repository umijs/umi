// @ts-ignore
import { create } from 'dva-core';
import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { useAppData } from 'umi';

interface IDvaApp {
  start: Function;
  model: Function;
  _store: any;
  _history: any;
}

function DvaRoot(props: any) {
  const { navigator } = useAppData();
  const app = useRef<IDvaApp>();
  if (!app.current) {
    app.current = create(
      {
        history: navigator,
      },
      {
        initialReducer: {},
        setupMiddlewares(middlewares: Function[]) {
          return [...middlewares];
        },
        setupApp(app: IDvaApp) {
          app._history = navigator;
        },
      },
    );
    // init models
    app.current!.model({
      namespace: 'count',
      state: 0,
      reducers: {
        add(state: number) {
          return state + 1;
        },
      },
      subscriptions: {
        setup(opts: any) {
          console.log('setup', opts);
        },
      },
    });
    app.current!.start();
  }
  return <Provider store={app.current!._store}>{props.children}</Provider>;
}

export function dataflowProvider(container: any, opts: any) {
  return React.createElement(DvaRoot, opts, container);
}
