import { extractIcons } from './extractIcons';

test('normal', () => {
  expect(extractIcons(`<Icon name="foo" />`)).toEqual(['foo']);
});

test('with chaos', () => {
  expect(extractIcons(`<Icon  name="foo" />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon name='foo' />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon bar='bar' name="foo" hoo />`)).toEqual(['foo']);
  expect(extractIcons(`<Icon name="foo bar" />`)).toEqual(['foo bar']);
});

test('multiple', () => {
  expect(extractIcons(`<Icon name="foo" /><Icon name="bar" />`)).toEqual([
    'foo',
    'bar',
  ]);
});
