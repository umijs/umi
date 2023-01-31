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

test('hover', () => {
  expect(extractIcons(`<Icon hover="foo" />`)).toEqual(['foo']);
});

test('icon + hover', () => {
  expect(extractIcons(`<Icon icon="bar" hover="foo" />`)).toEqual([
    'bar',
    'foo',
  ]);
});

test('icon + hover with same icon', () => {
  expect(extractIcons(`<Icon icon="bar" hover="bar" />`)).toEqual(['bar']);
});

test('icon in jsx props', () => {
  expect(extractIcons(`<Button icon={<Icon icon="bar" />}></Button>`)).toEqual([
    'bar',
  ]);
});

xtest('only the first icon attribute is valid', () => {
  expect(extractIcons(`<Icon icon="foo" icon="bar" />`)).toEqual(['foo']);
});
