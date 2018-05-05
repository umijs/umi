import expect from 'expect';
import stripJSONQuote from './stripJSONQuote';

describe('stripJSONQuote', () => {
  it('component', () => {
    const striped = stripJSONQuote(`
{
  "a": "aaa",
  "component": "haha"
}
    `);
    expect(striped).toEqual(`
{
  "a": "aaa",
  "component": haha
}
    `);
  });

  it('child component', () => {
    const striped = stripJSONQuote(`
{
  "a": "aaa",
  "b": {
    "component": "BBB"
  }
}
    `);
    expect(striped).toEqual(`
{
  "a": "aaa",
  "b": {
    "component": BBB
  }
}
    `);
  });

  it('Route', () => {
    const striped = stripJSONQuote(`
{
  "a": "aaa",
  "Route": "haha"
}
    `);
    expect(striped).toEqual(`
{
  "a": "aaa",
  "Route": haha
}
    `);
  });
});
