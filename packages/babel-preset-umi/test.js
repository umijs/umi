const { transform } = require('@babel/core');

const { code } = transform(
  `
import { a } from './a';
console.log(a);
`,
  {
    filename: 'file.ts',
    presets: [
      [
        require.resolve('./lib'),
        {
          typescript: true,
          react: true,
          env: {
            targets: {
              node: 'current',
            },
            modules: 'commonjs',
          },
        },
      ],
    ],
  },
);

console.log(code);
