import { IApi, IScript } from '../../types';

export async function getMarkupArgs(opts: { api: IApi }) {
  const headScripts = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLHeadScripts',
    type: opts.api.ApplyPluginsType.add,
    initialValue: opts.api.config.headScripts || [],
  });
  const scripts: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLScripts',
    type: opts.api.ApplyPluginsType.add,
    initialValue: opts.api.config.scripts || [],
  });
  return {
    routes: opts.api.appData.routes,
    favicon: opts.api.config.favicon,
    headScripts,
    scripts,
    // modifyHTML: () => {},
  };
}
