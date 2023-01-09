import { extractIcons } from './extract';

test('normal', () => {
  expect(extractIcons(`<Icon icon="foo" />`)).toEqual(['foo']);
});

test('with chaos', () => {
  expect(extractIcons(`<Icon  icon="foo" />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon icon='foo' />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon bar='bar' icon="foo" hoo />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon icon="foo bar" />`)).toEqual(['foo bar']);
});

test('multiple', () => {
  expect(extractIcons(`<Icon icon="foo" /><Icon icon="bar" />`)).toEqual([
    'foo',
    'bar',
  ]);
});

test('only the first icon attribute is valid', () => {
  expect(extractIcons(`<Icon icon="foo" icon="bar" />`)).toEqual(['foo']);
});
