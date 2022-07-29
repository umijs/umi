import { Runner } from './packageJSON';

test('transform', () => {
  expect(
    new Runner({ cwd: '', context: {} as any }).transform(
      {
        dependencies: { umi: '3' },
      },
      'umi',
    ),
  ).toEqual({
    dependencies: { umi: '^4.0.0' },
    scripts: {
      lint: 'umi lint',
      'lint:fix': 'umi lint --fix',
      postinstall: 'umi setup',
      setup: 'umi setup',
    },
  });
});

test('setup script reserve other scripts', () => {
  const newPkg = new Runner({ cwd: '', context: {} as any }).transform(
    {
      scripts: {
        postinstall: 'umi g tmp && foo',
      },
      dependencies: { umi: '^4.0.0' },
    },
    'umi',
  );
  expect(newPkg.scripts!.postinstall).toEqual(`umi setup && foo`);
});

test('delete devDependencies ', () => {
  const newPkg = new Runner({
    cwd: '',
    context: {
      devDeps: {
        excludes: ['eslint', '@umijs/fabric', 'stylelint'],
        includes: {
          jest: '^27.5.1',
        },
      },
      deps: {
        excludes: ['eslint', '@umijs/fabric', 'stylelint'],
        includes: {
          antd: '^4.20.6',
        },
      },
    } as any,
  }).transform(
    {
      devDependencies: { husky: '^7.0.4', eslint: '2' },
      dependencies: { umi: '^4.0.0', stylelint: '1' },
    },
    'umi',
  );
  expect(newPkg.devDependencies!.eslint).toEqual(undefined);
  expect(newPkg.dependencies!.stylelint).toEqual(undefined);
  expect(newPkg.devDependencies!.jest).toEqual('^27.5.1');
  expect(newPkg.dependencies!.antd).toEqual('^4.20.6');
});

test('umi install in devDependencies ', () => {
  const newPkg = new Runner({ cwd: '', context: {} as any }).transform(
    {
      devDependencies: { umi: '^3.0.0' },
    },
    'umi',
  );
  expect(newPkg.devDependencies!.umi).toEqual('^4.0.0');
});

test('no install umi', () => {
  expect(() => {
    new Runner({ cwd: '', context: {} as any }).transform(
      {
        devDependencies: {},
      },
      'umi',
    );
  }).toThrow(/umi dependency not found in package.json/);
});

test('mock run package runner', () => {
  expect(() => {
    new Runner({
      cwd: '',
      context: {
        pkgPath: '',
        pkg: {
          scripts: {
            postinstall: 'umi g tmp && foo',
          },
          dependencies: { umi: '^4.0.0' },
        },
        importSource: 'umi',
      } as any,
    }).run();
  }).not.toThrow();
});
