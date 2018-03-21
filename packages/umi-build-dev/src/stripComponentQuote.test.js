import expect from 'expect';
import stripComponentQuote from './stripComponentQuote';

describe('stripComponentQuote', () => {
  it('normal', () => {
    const striped = stripComponentQuote(`
{
  "a": "aaa",
  "component": "haha",
  "b": {
    "d": "ddd",
    "component": "hahaha",
    "b": "bbb"
  }
}
    `);
    expect(striped).toEqual(`
{
  "a": "aaa",
  "component": haha,
  "b": {
    "d": "ddd",
    "component": hahaha,
    "b": "bbb"
  }
}
    `);
  });
});
