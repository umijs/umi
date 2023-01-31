// @ts-ignore
import data from '../package.json';

enum EFramework {
  umi = 'umi',
  max = '@umijs/max',
  bigfish = '@alipay/bigfish',
}

export default (api: any) => {
  api.onStart(() => {
    const isUmi3 = !!api.utils;
    let logger = console;
    let chalk: any;
    let framework = EFramework.umi;
    let frameworkName = 'Umi';
    let frameworkCliName = 'umi';
    let majorVersion = '3';

    if (isUmi3) {
      logger = api.logger;
      chalk = api.utils.chalk;
    } else {
      try {
        logger = require('umi/plugin-utils').logger;
        chalk = require('umi/plugin-utils').chalk;
      } catch (error) {
        console.error('error');
      }
      frameworkName = api.appData.umi.name;
      framework = api.appData.umi.importSource;
      frameworkCliName = api.appData.umi.cliName;
      majorVersion = api.appData.umi.version.split('.')[0];
    }

    if (process.env.BIGFISH_INFO) {
      frameworkName = 'Bigfish';
      framework = EFramework.bigfish;
    }

    const item = getDidYouKnow(data.didYouKnow, framework, majorVersion);
    if (!item) return;
    const { text, url } = item;
    const info = [
      `[你知道吗？] `,
      text
        .replace(/%%frameworkName%%/g, frameworkName)
        .replace(/%%frameworkCliName%%/g, frameworkCliName),
      url ? `，详见 ${url}` : '。',
    ];
    logger.info(chalk.yellow(info.join('')));
  });

  function getDidYouKnow(
    items: ITip[] = [],
    framework: Framework,
    majorVersion: string,
  ) {
    // 1、get matched
    const matched = items.filter((item: any) => {
      return (
        (!item.framwork || item.framwork.includes(framework)) &&
        (!item.majorVersion || majorVersion === `${item.majorVersion}`)
      );
    });
    // 2、matched.length ? random : null
    if (matched.length) {
      const luck = Math.floor(Math.random() * matched.length);
      return matched[luck];
    }
    return null;
  }
};

type Framework = `${EFramework}`;

interface ITip {
  text: string;
  url?: string;
  majorVersion?: number;
  framework?: Framework[];
}
