import { IApi } from '@umijs/types';

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
    return api.config.favicon!
      ? [
          {
            rel: 'shortcut icon',
            type: 'image/x-icon',
            href: api.config.favicon!,
          },
        ]
      : [];
  });
}
