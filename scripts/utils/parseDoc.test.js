const parseDoc = require('./parseDoc');

test('normal', () => {
  const ret = parseDoc(`
---
a: b
c: d
---

# foo

bar
mie
  `);
  expect(ret).toEqual({
    hasYamlConfig: true,
    title: 'foo',
    yamlConfig: ['a: b', 'c: d'],
    body: ['', 'bar', 'mie'],
  });
});

test('no yarml', () => {
  const ret = parseDoc(`
# foo

bar
mie
  `);
  expect(ret).toEqual({
    hasYamlConfig: false,
    title: 'foo',
    yamlConfig: [],
    body: ['', 'bar', 'mie'],
  });
});

test('yaml + body', () => {
  const ret = parseDoc(`
---
a: b
---

bar
mie
  `);
  expect(ret).toEqual({
    hasYamlConfig: true,
    title: null,
    yamlConfig: ['a: b'],
    body: ['', 'bar', 'mie'],
  });
});

test('no title', () => {
  const ret = parseDoc(`
bar
mie
  `);
  expect(ret).toEqual({
    hasYamlConfig: false,
    title: null,
    yamlConfig: [],
    body: ['bar', 'mie'],
  });
});

test('multiple h1 like tag', () => {
  const ret = parseDoc(`
# foo

bar
# g
mie
  `);
  expect(ret).toEqual({
    hasYamlConfig: false,
    title: 'foo',
    yamlConfig: [],
    body: ['', 'bar', '# g', 'mie'],
  });
});
