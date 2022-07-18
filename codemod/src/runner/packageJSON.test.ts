import { Runner } from './packageJSON';

test('transform', () => {
  2;
  expect(
    new Runner({ cwd: '', context: {} as any }).transform({
      dependencies: { '@alipay/bigfish': '1' },
      engines: {
        'install-alinode': '5',
      },
      ci: {
        version: 'alinode=5',
      },
      tnpm: {
        mode: 'yarn',
      },
    }),
  ).toEqual({
    dependencies: { '@alipay/bigfish': '^4.0.0' },
    scripts: {
      lint: 'bigfish lint',
      'lint:fix': 'bigfish lint --fix',
      postinstall: 'bigfish setup',
      setup: 'bigfish setup',
    },
    engines: {
      'install-alinode': '6',
    },
    ci: {
      version: 'alinode=6',
    },
    tnpm: {},
  });
});

test('setup script reserve other scripts', () => {
  const newPkg = new Runner({ cwd: '', context: {} as any }).transform({
    scripts: {
      postinstall: 'bigfish g tmp && foo',
    },
    dependencies: { '@alipay/bigfish': '^4.0.0' },
  });
  expect(newPkg.scripts!.postinstall).toEqual(`bigfish setup && foo`);
});
