import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';
import { transformSync } from '../compiled/babel/core';

const runtimePlugin = require('../bundles/babel/transformRuntime');
const originalRuntimeModule = require('@babel/plugin-transform-runtime');
const originalRuntimePlugin =
  originalRuntimeModule.default || originalRuntimeModule;
const presetEnv = require('../compiled/babel/preset-env');

let fixture: string;
let runtime8: string;
let runtime7: string;

function createRuntime(name: string, dependency: string) {
  const root = join(fixture, name);
  mkdirSync(join(root, 'node_modules/@babel'), { recursive: true });
  symlinkSync(
    dirname(require.resolve(`${dependency}/package.json`)),
    join(
      root,
      'node_modules/@babel',
      name.startsWith('corejs') ? `runtime-${name}` : 'runtime',
    ),
    'junction',
  );
  return root;
}

beforeAll(() => {
  fixture = mkdtempSync(join(tmpdir(), 'umi-runtime-compat-'));
  runtime8 = createRuntime('v8', '@babel/runtime');
  runtime7 = createRuntime('v7', '@babel/runtime-v7');
});

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

function compile(
  code: string,
  options: Record<string, any> = {},
  config: Record<string, any> = {},
) {
  return transformSync(code, {
    configFile: false,
    babelrc: false,
    filename: join(runtime8, 'app.js'),
    cwd: runtime8,
    presets: [[presetEnv, { targets: { ie: '11' }, modules: 'commonjs' }]],
    plugins: [[runtimePlugin, { absoluteRuntime: runtime8, ...options }]],
    ...config,
  })!;
}

function execute(
  code: string,
  root = runtime8,
  globals: Record<string, any> = {},
) {
  const module = { exports: {} as Record<string, any> };
  new Function('require', 'module', 'exports', ...Object.keys(globals), code)(
    createRequire(join(root, 'app.cjs')),
    module,
    module.exports,
    ...Object.values(globals),
  );
  return module.exports;
}

const program = `
  class Counter {
    #value = 40;
    #increment() { this.#value++; }
    next() { this.#increment(); return this.#value; }
  }
  function* values() { try { yield 42; } finally {} }
  async function* asyncValues() { await Promise.resolve(); yield 43; }
  export async function run() {
    const [first, second] = new Set([44, 45]);
    const result = await asyncValues().next();
    return [new Counter().next(), values().next().value, result.value, first, second];
  }
`;

test.each([false, true, 'auto'])(
  'executes Babel 7 transforms with runtime 8 and useESModules=%s',
  async (useESModules) => {
    const { code } = compile(program, { version: '^8.0.7', useESModules });
    expect(code).toContain('/@babel/runtime/helpers/asyncToGenerator.js');
    expect(code).not.toMatch(
      /runtime\/(?:regenerator|helpers\/esm\/|helpers\/regeneratorRuntime)/,
    );
    expect(await execute(code!).run()).toEqual([41, 42, 43, 44, 45]);
  },
);

test('uses the installed runtime 8 when existing configuration declares version 7', async () => {
  const { code } = compile(program, { version: '^7.23.6' });
  expect(await execute(code!).run()).toEqual([41, 42, 43, 44, 45]);
  expect(code).not.toContain('@babel/runtime/regenerator');
});

test.each([false, true])(
  'preserves constructors with a static bind method without Reflect (loose=%s)',
  (loose) => {
    const source = `
      class Counter {
        static bind() { throw new Error('static bind must not be called'); }
        constructor(value) { this.value = value; }
      }
      Date.bind = function () { throw new Error('native bind must not be called'); };
      class CustomDate extends Date {}
      const args = [42];
      module.exports = [new Counter(...args).value, new CustomDate(0).getTime()];
    `;
    const results = [runtime7, runtime8].map((root, index) => {
      const { code } = compile(
        source,
        { absoluteRuntime: root, version: index === 0 ? '^7.23.6' : '^8.0.7' },
        {
          presets: [
            [presetEnv, { targets: { ie: '11' }, modules: 'commonjs', loose }],
          ],
        },
      );
      const output = join(root, 'construct.cjs');
      writeFileSync(output, code!);
      // Start a fresh process so the helpers also detect an environment without
      // Reflect, rather than reusing their detection cache from another test.
      return JSON.parse(
        execFileSync(
          process.execPath,
          [
            '-e',
            `globalThis.Reflect = undefined; console.log(JSON.stringify(require(${JSON.stringify(
              output,
            )})));`,
          ],
          { encoding: 'utf8' },
        ),
      );
    });
    expect(results).toEqual([
      [42, 0],
      [42, 0],
    ]);
  },
);

test.each([false, true])(
  'preserves object rest without reading a Proxy prototype (loose=%s)',
  (loose) => {
    const source = `
      const source = new Proxy({ selected: 0, value: 42 }, {
        getPrototypeOf() { throw new Error('unexpected prototype read'); },
      });
      const { selected, ...rest } = source;
      export const result = rest.value;
    `;
    const results = [runtime7, runtime8].map((root, index) => {
      const { code } = compile(
        source,
        { absoluteRuntime: root, version: index === 0 ? '^7.23.6' : '^8.0.7' },
        {
          presets: [
            [presetEnv, { targets: { ie: '11' }, modules: 'commonjs', loose }],
          ],
        },
      );
      return execute(code!, root).result;
    });
    expect(results).toEqual([42, 42]);
  },
);

test('keeps a project runtime 7 compatible with the new default version 8', async () => {
  const { code } = compile(
    program,
    { absoluteRuntime: runtime7, version: '^8.0.7' },
    { cwd: runtime7 },
  );
  expect(code).toContain('/@babel/runtime/helpers/regeneratorRuntime.js');
  expect(await execute(code!, runtime7).run()).toEqual([41, 42, 43, 44, 45]);
});

test('preserves a runtime 7 version lower bound and its original plugin behavior', () => {
  const options = { absoluteRuntime: runtime7, version: '^7.0.0' };
  const code = 'export function* values() { yield 42; }';
  const output = compile(code, options);
  const original = compile(code, options, {
    plugins: [[originalRuntimePlugin, options]],
  });
  expect(output.code).toEqual(original.code);
  expect([...execute(output.code!, runtime7).values()]).toEqual([42]);
});

test('helpers:false keeps all helpers inline, including explicit legacy regenerator references', async () => {
  const { code } = compile(
    `${program}\nexport const runtime = regeneratorRuntime;`,
    { helpers: false },
  );
  expect(code).not.toContain('require(');
  const result = execute(code!);
  expect(await result.run()).toEqual([41, 42, 43, 44, 45]);
  expect(typeof result.runtime.wrap).toBe('function');
});

test('helpers:false preserves a helper generator installed by another plugin', () => {
  const generate = () => undefined;
  let preserved = false;
  const customPlugin = () => ({
    pre(file: any) {
      file.set('helperGenerator', generate);
    },
    visitor: {
      Program(_path: any, state: any) {
        preserved = state.file.get('helperGenerator') === generate;
      },
    },
  });
  const { code } = compile(
    'export class Counter { value() { return 42; } }',
    {},
    {
      plugins: [
        customPlugin,
        [runtimePlugin, { absoluteRuntime: runtime8, helpers: false }],
      ],
    },
  );
  expect(preserved).toBe(true);
  expect(new (execute(code!).Counter)().value()).toBe(42);
});

test('keeps legacy helpers requested by custom Babel plugins usable', () => {
  const customPlugin = () => ({
    visitor: {
      CallExpression(path: any, state: any) {
        const callee = path.get('callee');
        if (callee.isIdentifier({ name: 'legacySlice' })) {
          callee.replaceWith(state.addHelper('slicedToArrayLoose'));
        }
      },
    },
  });
  const source =
    'export function slice(value) { return legacySlice(value, 2); }';
  const compileWithRuntime = (root: string, version: string) =>
    compile(
      source,
      {},
      {
        plugins: [
          [runtimePlugin, { absoluteRuntime: root, version }],
          customPlugin,
        ],
      },
    ).code!;
  const current = compileWithRuntime(runtime8, '^8.0.7');
  const previous = compileWithRuntime(runtime7, '^7.23.6');
  expect(current).not.toContain('/helpers/slicedToArrayLoose');
  expect(execute(current).slice([1, 2, 3])).toEqual(
    execute(previous, runtime7).slice([1, 2, 3]),
  );
});

test('supports unbound regenerator globals with modern browser targets', () => {
  const { code } = compile(
    'export function getRuntime() { return regeneratorRuntime; }',
    {},
    {
      presets: [
        [presetEnv, { targets: { chrome: '80' }, modules: 'commonjs' }],
      ],
    },
  );
  expect(typeof execute(code!).getRuntime().wrap).toBe('function');
  expect(code).not.toContain('@babel/runtime/regenerator');
});

test('does not rewrite a shadowed regeneratorRuntime binding', () => {
  const { code } = compile(
    'export function identity(regeneratorRuntime) { return regeneratorRuntime; }',
    {},
    {
      presets: [
        [presetEnv, { targets: { chrome: '80' }, modules: 'commonjs' }],
      ],
    },
  );
  expect(code).not.toContain('_regeneratorRuntime');
  expect(execute(code!).identity(42)).toBe(42);
});

test('regenerator:false preserves explicit global references', () => {
  const sentinel = {};
  const { code } = compile(
    'export const runtime = regeneratorRuntime;',
    { regenerator: false },
    {
      presets: [
        [presetEnv, { targets: { chrome: '80' }, modules: 'commonjs' }],
      ],
    },
  );
  expect(
    execute(code!, runtime8, { regeneratorRuntime: sentinel }).runtime,
  ).toBe(sentinel);
});

test('keeps source maps for unchanged business source', () => {
  const { map } = compile(program, {}, { sourceMaps: true });
  expect(map!.sources).toEqual(['app.js']);
  expect(map!.sourcesContent).toEqual([program]);
  expect(map!.mappings).not.toBe('');
});

test('emits executable ESM using canonical runtime 8 exports for absoluteRuntime:false', () => {
  const { code } = compile(
    program,
    { absoluteRuntime: false, useESModules: true },
    { presets: [[presetEnv, { targets: { ie: '11' }, modules: false }]] },
  );
  expect(code).toContain('from "@babel/runtime/helpers/asyncToGenerator"');
  expect(code).not.toContain('/helpers/esm/');
  const output = join(runtime8, 'app.mjs');
  writeFileSync(output, code!);
  const result = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { run } from ${JSON.stringify(
        pathToFileURL(output).href,
      )}; console.log(JSON.stringify(await run()));`,
    ],
    { encoding: 'utf8' },
  );
  expect(JSON.parse(result)).toEqual([41, 42, 43, 44, 45]);
});

test.each([2, 3])(
  'preserves existing corejs:%s configuration and its runtime 7',
  async (corejs) => {
    const root = createRuntime(
      `corejs${corejs}`,
      `@babel/runtime-corejs${corejs}`,
    );
    const { code } = compile(
      'export async function run() { return Promise.resolve([1, 2].includes(2)); }',
      { absoluteRuntime: root, version: '^8.0.7', corejs },
      { cwd: root },
    );
    expect(code).toContain(`@babel/runtime-corejs${corejs}/`);
    expect(await execute(code!, root).run()).toBe(true);
  },
);

test('reports runtime-corejs3 version 8 instead of emitting removed polyfill imports', () => {
  const root = join(fixture, 'unsupported-corejs3');
  const packageRoot = join(root, 'node_modules/@babel/runtime-corejs3');
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(
    join(packageRoot, 'package.json'),
    JSON.stringify({
      name: '@babel/runtime-corejs3',
      version: '8.0.7',
      exports: { './package.json': './package.json' },
    }),
  );
  expect(() =>
    compile('Promise.resolve(42);', { absoluteRuntime: root, corejs: 3 }),
  ).toThrow('Keep that polyfill runtime on version 7');
});

test('keeps original validation of runtime options', () => {
  expect(() => compile('class A {}', { useESModules: 'invalid' })).toThrow(
    "The 'useESModules' option must be undefined, or a boolean, or 'auto'.",
  );
});

test('preserves the compiled plugin default export used by custom Babel configuration', async () => {
  const plugin = require('../compiled/babel/plugin-transform-runtime').default;
  const { code } = compile(
    program,
    {},
    {
      plugins: [[plugin, { absoluteRuntime: runtime8, version: '^8.0.7' }]],
    },
  );
  expect(await execute(code!).run()).toEqual([41, 42, 43, 44, 45]);
});
