import { IApi } from 'umi';

export default (api: IApi) => {
  const GA_KEY = process.env.GA_KEY;

  const enableBy = (opts: any) => {
    return opts.config.analytics || GA_KEY;
  };

  api.describe({
    key: 'analytics',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy,
  });

  // https://tongji.baidu.com/web/help/article?id=174&type=0
  const baiduTpl = (code: string) => {
    return `
    (function() {
      var hm = document.createElement('script');
      hm.src = 'https://hm.baidu.com/hm.js?${code}';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(hm, s);
    })();
  `;
  };

  const gaTpl = (code: string) => {
    return `
    (function(){
      if (!location.port) {
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;
          i[r] = i[r] || function () {
              (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
          a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', '${code}', 'auto');
        ga('send', 'pageview');
      }
    })();
  `;
  };

  api.addHTMLHeadScripts(() => {
    const { analytics = {} } = api.config;
    const { ga = GA_KEY, baidu } = analytics;
    return [
      baidu && {
        content: 'var _hmt = _hmt || [];',
      },
      api.env !== 'development' &&
        baidu && {
          content: baiduTpl(baidu),
        },
      api.env !== 'development' &&
        ga && {
          content: gaTpl(ga),
        },
    ].filter(Boolean);
  });
};
