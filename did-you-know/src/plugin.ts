import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import data from '../package.json';
// @ts-ignore
import terminalLink from '../compiled/terminal-link';

enum EFramework {
  umi = 'umi',
  max = '@umijs/max',
  bigfish = '@alipay/bigfish',
}

export default (api: any) => {
  const recordJSONPath = path.join(api.paths.absTmpPath, 'did-you-know.json');
  /** did_you_know 触发记录 */
  let records: Record<string, ITipRecord> = fs.existsSync(recordJSONPath)
    ? JSON.parse(fs.readFileSync(recordJSONPath, 'utf-8')) ?? {}
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

    const item = getDidYouKnow(
      data.didYouKnow,
      framework,
      majorVersion,
      records,
      (newRecords) => {
        records = newRecords;
      },
    );

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
  });

  api.onDevCompileDone(() => {
    if (fs.existsSync(api.paths.absTmpPath))
      fs.writeFileSync(recordJSONPath, JSON.stringify(records));
  });
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

function getDidYouKnow(
  items: ITip[] = [],
  framework: Framework,
  majorVersion: string,
  records: Record<string, ITipRecord>,
  updateRecords: (newRecords: Record<string, ITipRecord>) => void,
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
    return getTip(matched, records, updateRecords);
  }
  return null;
}

const MAX_RESET_COUNT = 5;
export function getTip(
  tips: ITip[],
  records: Record<string, ITipRecord>,
  updateRecords: (newRecords: Record<string, ITipRecord>) => void,
) {
  const available = tips.filter((tip) => {
    const record = getRecord(tip, records);
    return !record || record.count < MAX_RESET_COUNT;
  });

  // 仅有一个可选时，重置记录
  if (available.length === 1) {
    const curTip = available[0];
    updateRecords({
      [encodeURI(curTip.text)]: {
        lastTime: Date.now(),
        count: 1,
      },
    });
    return curTip;
  }

  for (const item of available) {
    if (!getRecord(item, records)) {
      updateRecords({
        ...records,
        [encodeURI(item.text)]: {
          count: 1,
          lastTime: Date.now(),
        },
      });
      return item;
    }
  }
  const sorted = available.sort((l, r) => {
    const lRecord = getRecord(l, records);
    const rRecord = getRecord(r, records);

    return lRecord.lastTime - rRecord.lastTime;
  });

  // 末位为上次输出的提示，不取
  const rIndex = Math.floor(Math.random() * (sorted.length - 1));

  const luckTip = sorted[rIndex];
  const curRecord = getRecord(luckTip, records);
  records[encodeURI(luckTip.text)] = {
    lastTime: Date.now(),
    count: curRecord.count + 1,
  };
  updateRecords(records);

  return luckTip;
}

function getRecord(tip: ITip, records: Record<string, ITipRecord>) {
  return records[encodeURI(tip.text)];
}
