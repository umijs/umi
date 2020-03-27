import { transform } from '@babel/core';
import { join, basename } from 'path';
import { readdirSync, readFileSync, existsSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

function testTransform(dir) {
  const filename = existsSync(join(fixtures, dir, 'origin.js'))
    ? join(fixtures, dir, 'origin.js')
    : join(fixtures, dir, 'origin.tsx');
  const origin = readFileSync(filename, 'utf-8');
  const { code } = transform(origin, {
    filename: `/tmp/${basename(filename)}`,
    presets: [require.resolve('babel-preset-umi'), require.resolve('@babel/preset-typescript')],
    plugins: [
      [
        require.resolve('./index'),
        {
          doTransform() {
            return true;
          },
        },
      ],
    ],
  });
  const expectedFile = existsSync(join(fixtures, dir, 'expected.js'))
    ? join(fixtures, dir, 'expected.js')
    : join(fixtures, dir, 'expected.tsx');
  const expected = readFileSync(expectedFile, 'utf-8');
  const { code: expectCode } = transform(expected, {
    filename: `/tmp/${basename(filename)}`,
    presets: [require.resolve('babel-preset-umi'), require.resolve('@babel/preset-typescript')],
  });
  // window 专用，去掉一下盘符，其实表现是正常的，但是为了保证测试通过
  expect(code.trim().replace(/[A-Z]:/g, '')).toMatchSnapshot();
  expect(expectCode.trim().replace(/[A-Z]:/g, '')).toMatchSnapshot();
}

readdirSync(fixtures).forEach(dir => {
  if (dir.charAt(0) !== '.') {
    const fn = dir.endsWith('-only') ? test.only : test;
    fn(dir, () => {
      testTransform(dir);
    });
  }
});
