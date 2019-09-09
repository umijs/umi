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

it('arrow function field', () => {
  const striped = stripJSONQuote(`
{
  "a": "aaa",
  "authority": "(() => false)"
}
  `);
  expect(striped).toEqual(`
{
  "a": "aaa",
  "authority": () => false
}
  `);
});

it('normal function field', () => {
  const striped = stripJSONQuote(`
{
  "a": "aaa",
  "authority": "(function test(a) { return a;})"
}
  `);
  expect(striped).toEqual(`
{
  "a": "aaa",
  "authority": function test(a) { return a;}
}
  `);
});
