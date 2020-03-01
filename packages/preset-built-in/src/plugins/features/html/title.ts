import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'title',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
  });

  api.modifyHTML(($, { route }) => {
    const title = route.title || api.config.title;
    if (title && (api.config.exportStatic || api.config.ssr)) {
      const titleEl = $('head > title');
      if (titleEl.length) {
        titleEl.html(title);
      } else {
        $('head').append(`<title>${title}</title>`);
      }
    }
    return $;
  });
};
