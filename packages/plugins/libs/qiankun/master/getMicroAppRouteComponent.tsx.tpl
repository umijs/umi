import React from 'react';
import { MicroApp } from './MicroApp';
{{#runtimeHistory}}
import { getCreateHistoryOptions } from 'umi';
{{/runtimeHistory}}
import { useLocation } from 'umi';

export function getMicroAppRouteComponent(opts: {
  appName: string;
  base: string;
  masterHistoryType: string;
  routeProps?: any;
}) {
  const { base, masterHistoryType, appName, routeProps } = opts;
  const RouteComponent = ({ match }: any) => {
    const url = useLocation().pathname;

    // 默认取静态配置的 base
    let umiConfigBase = base === '/' ? '' : base;

    {{#runtimeHistory}}
    // 存在 getCreateHistoryOptions 说明当前应用开启了 runtimeHistory，此时取运行时的 history 配置的 basename
    const { basename = '/' } = getCreateHistoryOptions();
    umiConfigBase = basename === '/' ? '' : basename;
    {{/runtimeHistory}}

    let runtimeMatchedBase =
      umiConfigBase + (url.endsWith('/') ? url.substr(0, url.length - 1) : url);

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
    return <MicroApp {...componentProps} />;
  };

  return RouteComponent;
}
