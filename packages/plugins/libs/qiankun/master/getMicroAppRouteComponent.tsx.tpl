import React from 'react';
import { useMatch } from 'umi';
import { MicroApp } from './MicroApp';
import { defaultMicroAppRouteMode, MicroAppRouteMode } from './constants';
{{#keepAlive}}
import { KeepAlive } from '{{{reactActivationPath}}}';
// React 18: autoFreeze must stay false or cached micro-app forms lose state.
KeepAlive.defaultProps = { ...(KeepAlive.defaultProps || {}), autoFreeze: false };
{{/keepAlive}}

export function getMicroAppRouteComponent(opts: {
  appName: string;
  base: string;
  routePath: string;
  routeMode: MicroAppRouteMode;
  masterHistoryType: string;
  routeProps?: any;
}) {
  const { base, masterHistoryType, appName, routeProps, routePath, routeMode = defaultMicroAppRouteMode } = opts;
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
{{#keepAlive}}
    // Cache key used by master tabs and slave closeKeepAliveTab callbacks.
    const cacheName = 'qiankun_/' + appName + '/';
    return (
      <KeepAlive name={cacheName} cacheKey={cacheName} autoFreeze={false}>
        {/* Skip qiankun unmount while AliveScope still holds the DOM */}
        <MicroApp {...componentProps} autoUnmount={false} />
      </KeepAlive>
    );
{{/keepAlive}}
{{^keepAlive}}
    return <MicroApp {...componentProps} />;
{{/keepAlive}}
  };

  return RouteComponent;
}

function trimEndSlash(p: string) {
  return p.endsWith('/') ? p.slice(0, -1) : p;
}
