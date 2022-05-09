import IConfigProcessor from './define';

test('test transform umi define to vite define', () => {
  expect(IConfigProcessor({ define: { df_1: 'a', df_2: 'b' } }, {})).toEqual({
    define: {
      df_1: '"a"',
      df_2: '"b"',
    },
  });
});
