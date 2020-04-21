// umi.server.js
import { cheerio } from '{{{ CheerioModule }}}';
import { renderServer, createServerElement } from '{{{ Renderer }}}';

import { routes } from '@@/core/routes'

export interface IParams {
  path: string;
  initialData?: object;
  htmlTemplate?: string;
  mountElementId?: string;
  context?: object;
}

export interface IRenderResult<T> {
  rootContainer: T;
  html?: T;
  error?: Error;
}

export interface IRender<T = string> {
  (params: IParams): Promise<IRenderResult<T>>;
}

// export default libraryExport: 'default'
export const render: IRender = async (params) => {
  let error;
  const { path, initialData, htmlTemplate, mountElementId = 'root', context = {} } = params;

  const opts = {
    path,
    initialData,
    context,
    routes,
  }

  const $ = cheerio.load(htmlTemplate);
  let rootContainer = '';
  try {
    // renderServer get { rootContainer, App }
    rootContainer = await renderServer(opts)
    // use ssr
    $('head').append(`<script>window.g_useSSR = true;</script>`)
  } catch (e) {
    // downgrade into csr
    error = e;
    console.error('[SSR ERROR]', e);
  }
  $(`#${mountElementId}`).append(rootContainer);

  const html = $.html();

  return {
    rootContainer,
    error,
    html,
  }
}

export { createServerElement }
