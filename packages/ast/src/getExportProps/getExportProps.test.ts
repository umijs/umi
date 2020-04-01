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
  },
  ee: [2],
  ff: null,
  gg: undefined,
  hh: () => {},
  jj() {}
};
foo.e = ['hh', { ff: 66 }, ['gg'], null, undefined, () => {}];

foo.f = true;
foo.g = false;
foo.i = null;
foo.j = undefined;
bar.h = true;
export default foo;
    `,
  );
  expect(props).toEqual({
    a: 1,
    b: '2',
    c: expect.any(Function),
    d: {
      aa: '1',
      bb: true,
      cc: {
        dd: 90,
      },
      ee: [2],
      ff: null,
      gg: undefined,
      hh: expect.any(Function),
      jj: expect.any(Function),
    },
    e: ['hh', { ff: 66 }, ['gg'], null, undefined, expect.any(Function)],
    f: true,
    g: false,
    i: null,
    j: undefined,
  });
});

test('no default export', () => {
  const props = getExportProps(
    `
export function foo () {}
    `,
  );
  expect(props).toEqual({});
});
