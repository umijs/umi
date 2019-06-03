import stripJSONQuote from './stripJSONQuote';

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

it('component with json', () => {
  const striped = stripJSONQuote(`
{
  "a": "aaa",
  "component": "haha {^a^:^b^}"
}
  `);
  expect(striped).toEqual(`
{
  "a": "aaa",
  "component": haha {"a":"b"}
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

it('Routes', () => {
  const striped = stripJSONQuote(`
{
  "a": "aaa",
  "Routes": "['a', 2]"
}
  `);
  expect(striped).toEqual(`
{
  "a": "aaa",
  "Routes": ['a', 2]
}
  `);
});
