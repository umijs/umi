import { Runner } from './packageJSON';

test('transform', () => {
  expect(
    new Runner({ cwd: '', context: {} as any }).transform({
      dependencies: { umi: '3' },
    }),
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
  const newPkg = new Runner({ cwd: '', context: {} as any }).transform({
    scripts: {
      postinstall: 'umi g tmp && foo',
    },
    dependencies: { umi: '^4.0.0' },
  });
  expect(newPkg.scripts!.postinstall).toEqual(`umi setup && foo`);
});
