import { KeepAlive, Link, Outlet, useLocation } from '@umijs/max';
import React, { useMemo } from 'react';
import { AppKeepAliveTabs } from '../components/AppKeepAliveTabs';
import './index.less';

const MICRO_APP_PREFIXES = ['/app1', '/app2'];

function isMicroAppPath(pathname: string) {
  return MICRO_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function Layout() {
  const location = useLocation();
  const isMicroApp = useMemo(
    () => isMicroAppPath(location.pathname),
    [location.pathname],
  );

  return (
    <div className="keepalive-layout">
      <header className="keepalive-layout__header">
        <strong>qiankun keepAlive</strong>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/app1/">App1</Link>
          <Link to="/app1/about">App1 /about</Link>
          <Link to="/app2/">App2</Link>
          <Link to="/app2/about">App2 /about</Link>
        </nav>
      </header>
      <AppKeepAliveTabs />
      <main className="keepalive-layout__main">
        {isMicroApp ? (
          <>
            {/*
              Empty KeepAlive registers a tab for location.pathname.
              Micro-app content renders outside so it keeps master providers.
            */}
            <KeepAlive
              name={location.pathname}
              cacheKey={location.pathname}
              saveScrollPosition={false}
              autoFreeze={false}
            >
              <></>
            </KeepAlive>
            <Outlet />
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
