import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Service } from 'umi/src/service/service';
import { GeneratorHelper } from '../../../dist/commands/generators/utils';

let willUseTLR = false;
jest.doMock('../../../dist/commands/generators/utils', () => {
  const originalModule = jest.requireActual(
    '../../../dist/commands/generators/utils',
  );
  return {
    __esModule: true,
    ...originalModule,
    promptsExitWhenCancel: jest.fn(() => {
      return { willUseTLR };
    }),
  };
});

const mockInstall = jest.fn();
jest
  .spyOn(GeneratorHelper.prototype, 'installDeps')
  .mockImplementation(mockInstall);

const fixtures = join(__dirname, '../../../fixtures/generate');

describe('jest generator', function () {
  process.env.APP_ROOT = join(fixtures);
  const jestConfPath = join(fixtures, 'jest.config.ts');
  const jestSetupPath = join(fixtures, 'jest-setup.ts');

  afterEach(() => {
    [jestConfPath, jestSetupPath].forEach((path) => {
      if (existsSync(path)) {
        unlinkSync(path);
      }
    });
    writeFileSync(join(fixtures, 'package.json'), '{}');
  });

  test('g jest', async () => {
    const service = new Service();
    await service.run2({
      name: 'g',
      args: { _: ['g', 'jest'] },
    });

    const pkg = JSON.parse(
      readFileSync(join(fixtures, 'package.json'), 'utf-8'),
    );

    expect(existsSync(jestConfPath)).toBeTruthy();
    expect(pkg['scripts']).toMatchObject({ test: 'jest' });
    expect(pkg['devDependencies']).toMatchObject({
      jest: '^27',
      '@types/jest': '^27',
      typescript: '^4',
      'ts-node': '^10',
    });
    expect(mockInstall).toBeCalled();
  });

  test('g jest with RTL', async () => {
    willUseTLR = true;
    const service = new Service();
    await service.run2({
      name: 'g',
      args: { _: ['g', 'jest'] },
    });

    const pkg = JSON.parse(
      readFileSync(join(fixtures, 'package.json'), 'utf-8'),
    );

    expect(existsSync(jestSetupPath)).toBeTruthy();
    expect(pkg['scripts']).toMatchObject({ test: 'jest' });
    expect(pkg['devDependencies']).toMatchObject({
      '@testing-library/react': '^13',
      '@testing-library/jest-dom': '^5.16.4',
      '@types/testing-library__jest-dom': '^5.14.5',
    });
    expect(mockInstall).toBeCalled();
  });

  test('warning when jest config exists', async () => {
    writeFileSync(jestConfPath, '{}');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const service = new Service();
    await service.run2({
      name: 'g',
      args: { _: ['g', 'jest'] },
    });
    expect(warnSpy.mock.calls[0][1]).toBe(
      'jest has already enabled. You can remove jest.config.{ts,js}, then run this again to re-setup.',
    );
  });
});
