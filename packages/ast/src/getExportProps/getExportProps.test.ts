import { getExportProps } from './getExportProps';

test('normal', () => {
  const props = getExportProps(
    `
const foo = () => {};
const bar = {};
foo.a = 1;
foo.b = '2';
foo.c = function() {};

foo.d = {
  aa: '1',
  bb: true,
  cc: {
    dd: 90
  }
};
foo.e = ['hh'];

foo.f = true;
foo.g = false;
bar.h = true;
export default foo;
    `,
  );
  expect(props).toEqual({
    a: 1,
    b: '2',
    d: {
      aa: '1',
      bb: true,
      cc: {
        dd: 90,
      },
    },
    e: ['hh'],
    f: true,
    g: false,
  });
});
