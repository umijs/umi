import { ApplyPluginsType } from '@umijs/runtime';
import React from 'react';
import RouterComponent from './RouteComponent';
import { IOpts } from './types';

export default function getRootContainer(opts: IOpts) {
  return opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <RouterComponent
        history={opts.history}
        routes={opts.routes}
        plugin={opts.plugin}
        ssrProps={opts.ssrProps}
        defaultTitle={opts.defaultTitle}
      />
    ),
    args: {
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
}
