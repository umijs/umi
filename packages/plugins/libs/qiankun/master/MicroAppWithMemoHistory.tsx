// @ts-nocheck
/* eslint-disable */

import React, { useCallback, useEffect, useRef } from 'react';
import { MicroApp, Props as MicroAppProps } from './MicroApp';

export interface Props extends MicroAppProps {
  history?: never;
}

export function MicroAppWithMemoHistory(componentProps: Props) {
  const { url, ...rest } = componentProps;
  const history = useRef();
  // url 的变更不会透传给下游，组件内自己会处理掉，所以这里直接用 ref 来存
  const historyOpts = useRef({
    type: 'memory',
    initialEntries: [url],
    initialIndex: 1,
  });
  const historyInitHandler = useCallback((h) => (history.current = h), []);

  useEffect(() => {
    // push history for slave app when url property changed
    // the initial url will be ignored because the history has not been initialized
    if (history.current && url) {
      history.current.push(url);
    }
  }, [url]);

  useEffect(() => {
    // reset the history when name changed
    historyOpts.current.initialEntries = [url];
    historyOpts.current.initialIndex = 1;
  }, [componentProps.name]);

  return (
    <MicroApp
      {...rest}
      history={historyOpts.current}
      onHistoryInit={historyInitHandler}
    />
  );
}
