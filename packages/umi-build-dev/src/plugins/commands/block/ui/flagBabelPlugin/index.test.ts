import { transform } from '@babel/core';
import { join } from 'path';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

function testTransform(dir) {
  const origin = readFileSync(join(fixtures, dir, 'origin.js'), 'utf-8');
  const { code } = transform(origin, {
    presets: [[require.resolve('../../../../../babel-preset-umi/src/index.js')]],
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
      console.log(code);
    } else {
      writeFileSync(expectedFile, code, 'utf-8');
    }
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
