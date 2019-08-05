import { update } from './setConfig';

test('update list', () => {
  expect(
    update(
      `
export default {};
      `,
      'history',
      'hash',
    ).trim(),
  ).toEqual(
    `
export default {
  history: 'hash',
};
    `.trim(),
  );
});

test('update boolean', () => {
  expect(
    update(
      `
export default {};
      `,
      'hash',
      'true',
    ).trim(),
  ).toEqual(
    `
export default {
  hash: true,
};
    `.trim(),
  );
  expect(
    update(
      `
export default {};
      `,
      'hash',
      'false',
    ).trim(),
  ).toEqual(
    `
export default {
  hash: false,
};
    `.trim(),
  );
});

test('update string', () => {
  expect(
    update(
      `
export default { publicPath: '/' };
      `,
      'publicPath',
      '/foo/',
    ).trim(),
  ).toEqual(
    `
export default {
  publicPath: '/foo/',
};
    `.trim(),
  );
});

test('update array', () => {
  expect(
    update(
      `
export default {};
      `,
      'plugins',
      '["a", "b", "c"]',
    ).trim(),
  ).toEqual(
    `
export default {
  plugins: ['a', 'b', 'c'],
};
    `.trim(),
  );
  expect(
    update(
      `
export default {};
      `,
      'plugins',
      '[["a", { b:1, c:"d" }]]',
    ).trim(),
  ).toEqual(
    `
export default {
  plugins: [
    [
      'a',
      {
        b: 1,
        c: 'd',
      },
    ],
  ],
};
    `.trim(),
  );
});

test('update object', () => {
  expect(
    update(
      `
export default {};
      `,
      'exportStatic',
      '{ htmlSuffix: true }',
    ).trim(),
  ).toEqual(
    `
export default {
  exportStatic: {
    htmlSuffix: true,
  },
};
    `.trim(),
  );
});

test('typescript', () => {
  expect(
    update(
      `
import { IConfig } from 'umi-types';
export default {} as IConfig;
      `,
      'history',
      'hash',
    ).trim(),
  ).toEqual(
    `
import { IConfig } from 'umi-types';
export default {
  history: 'hash',
} as IConfig;
    `.trim(),
  );
});
