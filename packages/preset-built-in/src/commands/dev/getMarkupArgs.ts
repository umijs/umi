import { IApi, IScript } from '../../types';

export async function getMarkupArgs(opts: { api: IApi }) {
  const headScripts = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLHeadScripts',
    initialValue: opts.api.config.headScripts || [],
  });
  const scripts: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLScripts',
    initialValue: opts.api.config.scripts || [],
  });
  const metas: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLMetas',
    initialValue: opts.api.config.metas || [],
  });
  const links: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLLinks',
    initialValue: opts.api.config.links || [],
  });
  const styles: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLStyles',
    initialValue: opts.api.config.styles || [],
  });
  return {
    routes: opts.api.appData.routes,
    favicon: opts.api.config.favicon,
    headScripts,
    scripts,
    metas,
    links,
    styles,
    // modifyHTML: () => {},
  };
}
