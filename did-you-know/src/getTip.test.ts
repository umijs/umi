import { getTip } from './plugin';

const testTips = [{ text: '1' }, { text: '2' }, { text: '3' }];

test('first show tip did not prompt, then random, must be different from prev', () => {
  let records = {};

  let n = 0;
  let prev = '';
  jest.useFakeTimers();
  while (n < 30) {
    jest.setSystemTime(new Date(`${n} Aug 2022 00:00:00 GMT`).getTime());
    let tip = getTip(testTips, records, (newrecords) => {
      records = newrecords;
    });

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
