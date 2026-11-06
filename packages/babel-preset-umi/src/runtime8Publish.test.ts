import { parse } from '@umijs/bundler-utils/compiled/babel/core';
import { readFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';

// Exercise Father's installed Babel 7 loader, including its own older Umi preset.
const fatherTransform =
  require('father/dist/builder/bundless/loaders/javascript/babel').default;
const packageRoot = join(__dirname, '..');
const runtimeRequire = createRequire(join(packageRoot, 'package.json'));

function getPublishPlugins(directory = packageRoot) {
  const cwd = jest.spyOn(process, 'cwd').mockReturnValue(directory);
  let config: any;
  try {
    jest.isolateModules(() => {
      config = require('../../../.fatherrc.base').default;
    });
  } finally {
    cwd.mockRestore();
  }
  return config.extraBabelPlugins;
}

function publish(
  source: string,
  format: 'esm' | 'cjs',
  directory = packageRoot,
  filename = join(directory, 'src/runtime8-publish-fixture.ts'),
) {
  return fatherTransform.call(
    {
      config: {
        format,
        platform: 'browser',
        targets: { ie: 11 },
        extraBabelPlugins: getPublishPlugins(directory),
      },
      pkg: require(join(directory, 'package.json')),
      paths: {
        cwd: directory,
        fileAbsPath: filename,
        itemDistAbsPath: join(directory, 'dist/runtime8-publish-fixture.js'),
      },
    },
    source,
  )[0] as string;
}

function getRuntimeImports(output: string) {
  const ast = parse(output, { sourceType: 'module' })!;
  return ast.program.body
    .filter((node: any) => node.type === 'ImportDeclaration')
    .map((node: any) => node.source.value as string)
    .filter((request: string) => request.startsWith('@babel/runtime/'));
}

function getSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'fixtures' ? [] : getSources(filename);
    }
    return /(?<!\.test)\.tsx?$/.test(entry.name) ? [filename] : [];
  });
}

function execute(source: string) {
  const module = { exports: {} as any };
  new Function('require', 'module', 'exports', source)(
    runtimeRequire,
    module,
    module.exports,
  );
  return module.exports;
}

const source = `
export class Counter {
  #value = 1;
  next() { return ++this.#value; }
}

export async function run() {
  const values = [];
  async function* asyncValues() { yield await Promise.resolve(2); }
  for await (const value of asyncValues()) { values.push(value); }
  function* increments() { yield new Counter().next(); }
  return [...values, ...increments()];
}
`;

test('Father publishes portable runtime 8 imports for ESM consumers', () => {
  const output = publish(source, 'esm');
  const imports = getRuntimeImports(output);

  expect(imports).toContain('@babel/runtime/helpers/classCallCheck');
  for (const request of imports) {
    expect(request).toMatch(/^@babel\/runtime\/helpers\/[^/]+$/);
    expect(() => runtimeRequire.resolve(request)).not.toThrow();
  }
  expect(output).not.toContain(packageRoot);
});

test.each([
  ['umi', 'src/client'],
  ['renderer-react', 'src'],
  ['renderer-vue', 'src'],
  ['babel-preset-umi', 'src'],
])(
  'Father publishes portable runtime imports for %s sources',
  (name, input) => {
    const directory = join(packageRoot, '..', name);
    const resolveRuntime = createRequire(join(directory, 'package.json'));
    const runtimeImports: string[] = [];
    const files = getSources(join(directory, input));
    expect(files.length).toBeGreaterThan(0);

    for (const filename of files) {
      const output = publish(
        readFileSync(filename, 'utf8'),
        'esm',
        directory,
        filename,
      );
      expect(output).not.toContain(directory);
      runtimeImports.push(...getRuntimeImports(output));
    }
    expect(runtimeImports.length).toBeGreaterThan(0);
    for (const request of new Set(runtimeImports)) {
      expect(request).toMatch(/^@babel\/runtime\/helpers\/[^/]+$/);
      expect(() => resolveRuntime.resolve(request)).not.toThrow();
    }
  },
);

test('Father publishes executable async generators and private fields for CJS consumers', async () => {
  const output = publish(source, 'cjs');
  const result = execute(output);
  expect(await result.run()).toEqual([2, 2]);
  expect(new result.Counter().next()).toBe(2);
});

test('Father preserves explicit legacy regeneratorRuntime references', () => {
  const output = publish(
    'export function getRuntime() { return regeneratorRuntime; }',
    'cjs',
  );
  const result = execute(output);
  expect(typeof result.getRuntime().wrap).toBe('function');
  expect(typeof result.getRuntime().mark).toBe('function');
  expect(output).not.toContain('@babel/runtime/regenerator');
});

test('Father leaves packages without a runtime dependency on their existing build path', () => {
  const cwd = jest
    .spyOn(process, 'cwd')
    .mockReturnValue(join(__dirname, '../../core'));
  try {
    jest.isolateModules(() => {
      const config = require('../../../.fatherrc.base').default;
      expect(config.extraBabelPlugins).toEqual([]);
    });
  } finally {
    cwd.mockRestore();
  }
});
