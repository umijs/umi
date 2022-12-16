import { join, normalize } from 'path';
import { generateFile } from '@umijs/utils';
import { ComponentGenerator } from './component';

jest.mock('@umijs/utils', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('@umijs/utils');

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    generateFile: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

test('generate component with single name', async () => {
  await runGeneratorWith('foo');

  expect(generateFile).toBeCalledTimes(2);
  expect(generateFile).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      target: normalize('/my/src/path/components/Foo/index.ts'),
      baseDir: normalize('/my'),
      data: { compName: 'Foo' },
    }),
  );
  expect(generateFile).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      target: normalize('/my/src/path/components/Foo/Foo.tsx'),
      baseDir: normalize('/my'),
      data: { compName: 'Foo' },
    }),
  );
});

test('test generate nested named component foo/bar/qux', async () => {
  await runGeneratorWith('foo/bar/qux');
  expect(generateFile).toBeCalledTimes(2);
  expect(generateFile).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      target: normalize('/my/src/path/components/foo/bar/Qux/index.ts'),
      data: { compName: 'Qux' },
    }),
  );
  expect(generateFile).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      target: normalize('/my/src/path/components/foo/bar/Qux/Qux.tsx'),
      data: { compName: 'Qux' },
    }),
  );
});

test('test generate nested named component foo/subPath/tailName', async () => {
  await runGeneratorWith('foo/subPath/tailName');

  expect(generateFile).toBeCalledTimes(2);
  expect(generateFile).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      target: normalize(
        '/my/src/path/components/foo/subPath/TailName/index.ts',
      ),
      data: { compName: 'TailName' },
    }),
  );
  expect(generateFile).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      target: normalize(
        '/my/src/path/components/foo/subPath/TailName/TailName.tsx',
      ),
      data: { compName: 'TailName' },
    }),
  );
});

describe('using custom template', () => {
  test('generate component with custom template name', async () => {
    const mockProjectPath = join(__dirname, '../../../fixtures/');
    await runGeneratorWith('foo', mockProjectPath);

    expect(generateFile).toBeCalledTimes(2);
    expect(generateFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        target: normalize('/my/src/path/components/Foo/index.ts'),
        path: join(mockProjectPath, 'templates/component/index.ts.tpl'),
        data: { compName: 'Foo' },
      }),
    );
    expect(generateFile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        target: normalize('/my/src/path/components/Foo/Foo.tsx'),
        path: join(mockProjectPath, 'templates/component/component.tsx.tpl'),
        data: { compName: 'Foo' },
      }),
    );
  });

  test('generate component with  defined variables', async () => {
    const mockProjectPath = join(__dirname, '../../../fixtures/');
    const userDefinedArgs = { foo: 'bar', count: 1 };
    await runGeneratorWith('foo', mockProjectPath, userDefinedArgs);

    expect(generateFile).toBeCalledTimes(2);
    expect(generateFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        target: normalize('/my/src/path/components/Foo/index.ts'),
        path: join(mockProjectPath, 'templates/component/index.ts.tpl'),
        data: { compName: 'Foo', ...userDefinedArgs },
      }),
    );
    expect(generateFile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        target: normalize('/my/src/path/components/Foo/Foo.tsx'),
        path: join(mockProjectPath, 'templates/component/component.tsx.tpl'),
        data: { compName: 'Foo', ...userDefinedArgs },
      }),
    );
  });
});

async function runGeneratorWith(
  name: string,
  appRoot = normalize('/my'),
  args: Record<string, any> = {},
) {
  const cg = new ComponentGenerator({
    componentName: name,
    srcPath: normalize('/my/src/path'),
    appRoot,
    args: { _: [], ...args },
  });

  await cg.run();
}
