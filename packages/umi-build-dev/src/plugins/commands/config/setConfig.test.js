import rimraf from 'rimraf';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import setConfig, { update } from './setConfig';

const fixture = join(__dirname, 'fixtures', 'setConfig');

test('setConfig', () => {
  const file = join(fixture, 'a.js');
  writeFileSync(file, `export default { hash: true }`, 'utf-8');
  setConfig({
    key: 'hash',
    value: 'false',
    file,
  });
  expect(readFileSync(file, 'utf-8').trim()).toEqual(
    `
export default {
  hash: false,
};
  `.trim(),
  );
  rimraf.sync(file);
});

test('setConfig uppercase strings', () => {
  const file = join(fixture, 'a.js');
  writeFileSync(file, `export default { newApps: [] }`, 'utf-8');
  setConfig({
    key: 'newApps',
    value: `[
      { name: 'Hello', source: 'master' },
      { name: 'World', source: 'ANTCLOUD' },
    ]`,
    file,
  });
  expect(readFileSync(file, 'utf-8').trim()).toEqual(
    `
export default {
  newApps: [
    {
      name: 'Hello',
      source: 'master',
    },
    {
      name: 'World',
      source: 'ANTCLOUD',
    },
  ],
};
  `.trim(),
  );
  rimraf.sync(file);
});

test('setConfig file not exist', () => {
  const file = join(fixture, 'b.js');
  setConfig({
    key: 'hash',
    value: 'false',
    file,
  });
  expect(readFileSync(file, 'utf-8').trim()).toEqual(
    `
export default {
  hash: false,
};
  `.trim(),
  );
  rimraf.sync(file);
});

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

// https://github.com/umijs/umi/issues/3866
test('update config uppercase strings', () => {
  expect(
    update(
      `
export default {
  newApps: [],
};
      `,
      'newApps',
      `[
        { name: 'Hello', source: 'master' },
        { name: 'World', source: 'ANTCLOUD' }
      ]`,
    ).trim(),
  ).toEqual(
    `
export default {
  newApps: [
    {
      name: 'Hello',
      source: 'master',
    },
    {
      name: 'World',
      source: 'ANTCLOUD',
    },
  ],
};
    `.trim(),
  );
});

test('update sub object and object', () => {
  expect(
    update(
      `
export default {
};
      `,
      {
        'a.b': 'b',
        'a.c': 'c',
        d: 'd',
      },
      null,
    ).trim(),
  ).toEqual(
    `
export default {
  a: {
    b: 'b',
    c: 'c',
  },
  d: 'd',
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

test('config plugin', () => {
  expect(
    update(
      `
export default {
  plugins: [
    ['umi-plugin-react', {}],
  ],
};
      `,
      {
        history: 'hash',
        runtimePublicPath: 'true',
        'a.b': 'c',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        history: 'hash',
        runtimePublicPath: true,
        a: {
          b: 'c',
        },
      },
    ],
  ],
};
    `.trim(),
  );
});

test('config plugin without plugin config', () => {
  expect(
    update(
      `
export default {
  plugins: [
    ['umi-plugin-react'],
  ],
};
      `,
      {
        a: 'b',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        a: 'b',
      },
    ],
  ],
};
    `.trim(),
  );
});

test('config plugin with string plugin', () => {
  expect(
    update(
      `
export default {
  plugins: [
    'umi-plugin-react',
  ],
};
      `,
      {
        a: 'b',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        a: 'b',
      },
    ],
  ],
};
    `.trim(),
  );
});

test('config plugin with plugins identifier', () => {
  expect(
    update(
      `
const p = [
  [
    'umi-plugin-react',
  ],
];
export default {
  plugins: p,
};
      `,
      {
        a: 'b',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
const p = [
  [
    'umi-plugin-react',
    {
      a: 'b',
    },
  ],
];
export default {
  plugins: p,
};
    `.trim(),
  );
});

xtest('config plugin with plugins identifier XX', () => {
  expect(
    update(
      `
const p = [
  [
    'umi-plugin-react',
  ],
];
export default {
  plugins: p,
};
      `,
      {
        'a.b': 'b',
        'a.c': 'c',
        d: 'd',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
const p = [
  [
    'umi-plugin-react',
    {
      a: {
        b: 'b',
        c: 'c',
      },
      d: 'd',
    },
  ],
];
export default {
  plugins: p,
};
    `.trim(),
  );
});

test('config plugin with plugin identifier', () => {
  expect(
    update(
      `
const p = [
  'umi-plugin-react'
];
export default {
  plugins: [
    p
  ],
};
      `,
      {
        a: 'b',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
const p = [
  'umi-plugin-react',
  {
    a: 'b',
  },
];
export default {
  plugins: [p],
};
    `.trim(),
  );
});

test('config plugin with plugin config identifier', () => {
  expect(
    update(
      `
const pConfig = {};
const p = [
  'umi-plugin-react',
  pConfig,
];
export default {
  plugins: [
    p
  ],
};
      `,
      {
        a: 'b',
      },
      null,
      'umi-plugin-react',
    ).trim(),
  ).toEqual(
    `
const pConfig = {
  a: 'b',
};
const p = ['umi-plugin-react', pConfig];
export default {
  plugins: [p],
};
    `.trim(),
  );
});
