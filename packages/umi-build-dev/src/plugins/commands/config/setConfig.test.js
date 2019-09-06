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

test('update sub object', () => {
  expect(
    update(
      `
export default {
  a: {
    b: true,
  },
};
      `,
      'a.b',
      'false',
    ).trim(),
  ).toEqual(
    `
export default {
  a: {
    b: false,
  },
};
    `.trim(),
  );
});

test('update sub object not found', () => {
  expect(
    update(
      `
export default {
};
      `,
      'a.b.c.d',
      'false',
    ).trim(),
  ).toEqual(
    `
export default {
  a: {
    b: {
      c: {
        d: false,
      },
    },
  },
};
    `.trim(),
  );
});

test('update sub object partly not found', () => {
  expect(
    update(
      `
export default {
  a: {
    foo: 'bar',
  },
};
      `,
      'a.b.c.d',
      'false',
    ).trim(),
  ).toEqual(
    `
export default {
  a: {
    foo: 'bar',
    b: {
      c: {
        d: false,
      },
    },
  },
};
    `.trim(),
  );
});

test('update sub object failed when is not object expression', () => {
  expect(
    update(
      `
export default {
  a: {
    foo: 'bar',
    b: '',
  },
};
      `,
      'a.b.c.d',
      'false',
    ).trim(),
  ).toEqual(
    `
export default {
  a: {
    foo: 'bar',
    b: {
      c: {
        d: false,
      },
    },
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

test('export default reference', () => {
  expect(
    update(
      `
const a = {
};
export default a;
      `,
      'history',
      'hash',
    ).trim(),
  ).toEqual(
    `
const a = {
  history: 'hash',
};
export default a;
    `.trim(),
  );
});

test('export default reference (typescript)', () => {
  expect(
    update(
      `
import { IConfig } from 'umi-types';
const a: IConfig = {
};
export default a;
      `,
      'history',
      'hash',
    ).trim(),
  ).toEqual(
    `
import { IConfig } from 'umi-types';
const a: IConfig = {
  history: 'hash',
};
export default a;
    `.trim(),
  );
});

test('batch update', () => {
  expect(
    update(
      `
export default {};
      `,
      {
        history: 'hash',
        runtimePublicPath: 'true',
        'a.b': 'c',
      },
    ).trim(),
  ).toEqual(
    `
export default {
  history: 'hash',
  runtimePublicPath: true,
  a: {
    b: 'c',
  },
};
    `.trim(),
  );
});
