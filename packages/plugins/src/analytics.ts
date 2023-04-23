import type { IApi } from 'umi';

interface IAnalyticsConfig {
  baidu?: string;
  ga?: string;
  // GA 4 : https://support.google.com/analytics/answer/10089681?hl=zh-Hans
  ga_v2?: string;
}

type IScripts = Awaited<
  ReturnType<Parameters<IApi['addHTMLHeadScripts']>[0]['fn']>
>;

export default (api: IApi) => {
  const GA_KEY = process.env.GA_KEY;
  const GA_V2_KEY = process.env.GA_V2_KEY;

  const enableBy = (opts: any) => {
    return opts.config.analytics || GA_KEY;
  };

  api.describe({
    key: 'analytics',
    config: {
      schema({ zod }) {
        return zod
          .object({
            baidu: zod.string(),
            ga: zod.string(),
            ga_v2: zod.string(),
          })
          .partial();
      },
      onChange: api.ConfigChangeType.reload,
    },
    enableBy,
  });

  // https://tongji.baidu.com/web/help/article?id=174&type=0
  const baiduTpl = (code: string) => {
    return `
    (function() {
      var hm = document.createElement('script');
      hm.src = '//hm.baidu.com/hm.js?${code}';
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

  const gaV2Tpl = (code: string) => {
    return `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${code}');
    `.trim();
  };

  api.addHTMLHeadScripts(() => {
    const analytics = (api.config.analytics || {}) as IAnalyticsConfig;
    const { baidu, ga = GA_KEY, ga_v2 = GA_V2_KEY } = analytics;
    const scripts: IScripts = [];
    if (baidu) {
      scripts.push({
        content: 'var _hmt = _hmt || [];',
      });
    }
    if (api.env !== 'development') {
      if (baidu) {
        scripts.push({
          content: baiduTpl(baidu),
        });
      }
      if (ga) {
        scripts.push({
          content: gaTpl(ga),
        });
      }
      if (ga_v2) {
        scripts.push(
          {
            async: true,
            src: `//www.googletagmanager.com/gtag/js?id=${ga_v2}`,
          },
          {
            content: gaV2Tpl(ga_v2),
          },
        );
      }
    }
    return scripts.filter(Boolean);
  });
};
