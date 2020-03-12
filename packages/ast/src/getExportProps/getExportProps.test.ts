import { getExportProps } from './getExportProps';

test('normal', () => {
  const props = getExportProps(
    `
const foo = () => {};
const bar = {};
foo.a = 1;
foo.b = '2';
foo.c = function() {};

// TODO: support object and array
foo.d = {};
foo.e = [];

foo.f = true;
foo.g = false;
bar.h = true;
export default foo;
    `,
  );
  expect(props).toEqual({
    a: 1,
    b: '2',
    f: true,
    g: false,
  });
});
