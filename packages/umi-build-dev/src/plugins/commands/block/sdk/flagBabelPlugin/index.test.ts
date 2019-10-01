import { transform } from '@babel/core';
import { join, basename } from 'path';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

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
  const expectedFile = join(fixtures, dir, 'expected.js');
  if (existsSync(expectedFile)) {
    const expected = readFileSync(expectedFile, 'utf-8');
    expect(code.trim()).toEqual(expected.trim());
  } else {
    if (process.env.PRINT_CODE) {
      // console.log(code);
    }
    writeFileSync(expectedFile, code, 'utf-8');
  }
}

readdirSync(fixtures).forEach(dir => {
  if (dir.charAt(0) !== '.') {
    const fn = dir.endsWith('-only') ? test.only : test;
    fn(dir, () => {
      testTransform(dir);
    });
  }
});
