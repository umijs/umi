import { getTip } from './plugin';

const testTips = [{ text: '1' }, { text: '2' }, { text: '3' }];

test('first show tip did not prompt, then random, must be different from prev', async () => {
  let record = {};

  let n = 0;
  let prev = '';
  while (n < 10) {
    let tip = getTip(testTips, record, (newRecords) => {
      record = newRecords;
    });

    if (n === 0) {
      expect(tip.text).toEqual('1');
    }
    if (n === 1) {
      expect(tip.text).toEqual('2');
    }
    if (n === 2) {
      expect(tip.text).toEqual('3');
    }

    expect(tip.text).not.toEqual(prev);
    prev = tip.text;

    n += 1;
  }
});
