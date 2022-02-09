import { IApi } from '@umijs/types';
import { join } from 'path';

export default function (api: IApi) {
  api.describe({
    key: 'favicon',
    config: {
      schema(joi) {
        return joi.string();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  api.addHTMLLinks(() => {
    return api.config.favicon
      ? [
          {
            rel: 'shortcut icon',
            type: 'image/x-icon',
            href: getFaviconPath(api.config.favicon, api.config.publicPath),
          },
        ]
      : [];
  });
}

export function getFaviconPath(favicon: string, publicPath?: string | false) {
  return favicon.match(/^https?:\/\//)
    ? favicon
    : join(publicPath || '/', favicon);
}
