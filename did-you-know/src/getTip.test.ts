import type { ITip, ITipRecord } from './plugin';

let testTips: ITip[] = [
  { text: '1', index: 0 },
  { text: '2', index: 1 },
  { text: '3', index: 2 },
];

test('first show tip did not prompt, then random, must be different from prev', () => {
  let records: Record<string, ITipRecord> = {};

  let n = 0;
  let prev = '';

  function getTip() {
    const available = testTips.filter((tip) => {
      const record = records[tip.index];
      return !record || record.count < 5;
    });

    // 只剩一个选项，直接返回并重置记录
    if (available.length === 1) {
      const tip = available[0];

      records = {
        [tip.index]: {
          lastTime: Date.now(),
          count: 1,
        },
      };
      return tip;
    }

    // 存在未曾提示过的，或新增的提示，优先提示
    for (const tip of available) {
      if (!records[tip.index]) {
        records = {
          ...records,
          [tip.index]: {
            count: 1,
            lastTime: Date.now(),
          },
        };
        return tip;
      }
    }

    const sorted = available.sort(
      (l, r) => records[l.index].lastTime - records[r.index].lastTime,
    );
    // 末位为上次输出的提示，不取
    const rIndex = Math.floor(Math.random() * (sorted.length - 1));

    const luckTip = sorted[rIndex];

    records[luckTip.index] = {
      lastTime: Date.now(),
      count: records[luckTip.index].count + 1,
    };

    return luckTip;
  }

  jest.useFakeTimers();
  while (n < 30) {
    jest.setSystemTime(new Date(`${n} Aug 2022 00:00:00 GMT`).getTime());
    let tip = getTip();

    if (n === 0) {
      expect(tip.text).toBe('1');
    } else if (n === 1) {
      expect(tip.text).toBe('2');
    } else if (n === 2) {
      expect(tip.text).toBe('3');
    } else {
      expect(tip.text).not.toBe(prev);
      prev = tip.text;
    }
    n += 1;
  }
  jest.useRealTimers();
});
