import React from 'react';
import { useMatch } from 'umi';
import { MicroApp } from './MicroApp';
import { defaultMicroAppRouteMode, MicroAppRouteMode } from './constants';
import { KeepAlive } from 'react-activation';

export function getMicroAppRouteComponent(opts: {
  appName: string;
  base: string;
  routePath: string;
  routeMode: MicroAppRouteMode;
  masterHistoryType: string;
  routeProps?: any;
  keepAlive?: boolean;
}) {
  const { base, masterHistoryType, appName, routeProps, routePath, routeMode = defaultMicroAppRouteMode, keepAlive = true } = opts;
  const RouteComponent = () => {
    const match = useMatch(routePath);
    const url = match ? match.pathnameBase : '';
    // 默认取静态配置的 base
    let umiConfigBase = base === '/' ? '' : trimEndSlash(base);
    // 匹配模式下，routePath 不会作为 prefix
    const prefix = routeMode === MicroAppRouteMode.MATCH ? '' : trimEndSlash(url);

    // 拼接子应用挂载路由
    let runtimeMatchedBase = umiConfigBase + prefix;

    {{#dynamicRoot}}
    // @see https://github.com/umijs/umi/blob/master/packages/preset-built-in/src/plugins/commands/htmlUtils.ts#L102
    runtimeMatchedBase = window.routerBase || location.pathname.split('/').slice(0, -(path.split('/').length - 1)).concat('').join('/');
    {{/dynamicRoot}}

    const componentProps = {
      name: appName,
      base: runtimeMatchedBase,
      history: masterHistoryType,
      ...routeProps,
    };
    return keepAlive ? <KeepAlive name={'qiankun_' + componentProps.base}><MicroApp {...componentProps} /></KeepAlive> : <MicroApp {...componentProps} />;
  };

  return RouteComponent;
}

function trimEndSlash(p: string) {
  return p.endsWith('/') ? p.slice(0, -1) : p;
}
