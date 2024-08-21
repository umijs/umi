import fs from 'fs';
import path from 'path';
// @ts-ignore
import data from '../package.json';
// @ts-ignore
import terminalLink from '../compiled/terminal-link';

enum EFramework {
  umi = 'umi',
  max = '@umijs/max',
  bigfish = '@alipay/bigfish',
}
const MAX_RESET_COUNT = 5;
const RECORD_FILE = 'did-you-know.json';

export default (api: any) => {
  const recordJSONPath = path.join(
    api.paths.absNodeModulesPath,
    '.cache',
    RECORD_FILE,
  );
  // did_you_know 触发记录
  let records: Record<string, ITipRecord> = fs.existsSync(recordJSONPath)
    ? JSON.parse(fs.readFileSync(recordJSONPath, 'utf-8'))
    : {};

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
      url ? formatLink(url) : '。',
    ];
    logger.info(chalk.yellow(info.join('')));

    const cacheDir = path.join(api.paths.absNodeModulesPath, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(recordJSONPath, JSON.stringify(records), 'utf-8');
  });

  function getDidYouKnow(
    items: ITip[] = [],
    framework: Framework,
    majorVersion: string,
  ) {
    // 1、get matched
    const matched = items.filter((item) => {
      return (
        (!item.framework || item.framework.includes(framework)) &&
        (!item.majorVersion || majorVersion === `${item.majorVersion}`)
      );
    });
    // 2、matched.length ? random : null
    if (matched.length) {
      // 未提示过、已提示数小于最大值，作为待选项
      const available = matched.filter(({ text }) => {
        const record = records[encodeURI(text)];
        return !record || record.count < MAX_RESET_COUNT;
      });

      // 只剩一个选项，直接返回并重置记录
      if (available.length === 1) {
        const tip = available[0];
        records = {
          [encodeURI(tip.text)]: {
            lastTime: Date.now(),
            count: 1,
          },
        };
        return tip;
      }

      // 存在未曾提示过的，或新增的提示，优先提示
      for (const tip of available) {
        const recordKey = encodeURI(tip.text);
        if (!records[recordKey]) {
          records = {
            ...records,
            [recordKey]: {
              count: 1,
              lastTime: Date.now(),
            },
          };
          return tip;
        }
      }

      available.sort(
        (l, r) =>
          records[encodeURI(l.text)].lastTime -
          records[encodeURI(r.text)].lastTime,
      );
      // 末位为上次输出的提示，不取
      const rIndex = Math.floor(Math.random() * (available.length - 1));

      const luckTip = available[rIndex];
      const recordKey = encodeURI(luckTip.text);
      records[recordKey] = {
        lastTime: Date.now(),
        count: records[recordKey].count + 1,
      };

      return luckTip;
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

interface ITipRecord {
  lastTime: number;
  count: number;
}

function formatLink(url: string) {
  if (terminalLink.isSupported) {
    return `：${terminalLink('点我查看', url)}`;
  } else {
    return `，详见 ${url}`;
  }
}
