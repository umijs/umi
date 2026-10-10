import { KeepAlive, useAliveController } from '@umijs/max';
import React, { type ReactNode, useCallback, useEffect } from 'react';

export interface KeepAliveContainerProps {
  appName: string;
  children?: ReactNode;
}

/**
 * Cache the current page under `location.pathname`.
 * When this micro app has no cached pages left, notify the master to drop
 * `qiankun_/${appName}/`.
 */
export function KeepAliveContainer(props: KeepAliveContainerProps) {
  const { appName, children } = props;
  const { dropScope, getCachingNodes, refreshScope } = useAliveController();

  const drop = useCallback(
    (e: Event & { detail?: string[] }) => {
      const tabs = e.detail;
      if (!tabs?.length) return;

      Promise.all(tabs.map((d) => dropScope(d))).then(() => {
        const curNodes = getCachingNodes();
        if (curNodes.length === 0) {
          window.removeEventListener('dropTab', drop);
          window.closeKeepAliveTab?.(`qiankun_/${appName}/`);
        }
      });
    },
    [appName, dropScope, getCachingNodes],
  );

  const handleRefresh = useCallback(
    (e: Event & { detail?: { pathname?: string } }) => {
      const pathname = e.detail?.pathname;
      if (pathname) refreshScope(pathname);
    },
    [refreshScope],
  );

  useEffect(() => {
    window.addEventListener('dropTab', drop as EventListener);
    window.addEventListener('refreshTab', handleRefresh as EventListener);
    return () => {
      window.removeEventListener('refreshTab', handleRefresh as EventListener);
    };
  }, [drop, handleRefresh]);

  return (
    <KeepAlive
      cacheKey={location.pathname}
      name={location.pathname}
      saveScrollPosition={false}
      autoFreeze={false}
    >
      {children}
    </KeepAlive>
  );
}
