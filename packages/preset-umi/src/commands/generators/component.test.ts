import { join, normalize } from 'path';
import { ComponentGenerator } from './component';

test('generate component with single name', async () => {
  const { generateFile } = await runGeneratorWith('foo');

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
  const { generateFile } = await runGeneratorWith('foo/bar/qux');

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
  const { generateFile } = await runGeneratorWith('foo/subPath/tailName');

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
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('generate component with custom template name', async () => {
    const mockProjectPath = join(__dirname, '../../../fixtures/');
    const { generateFile } = await runGeneratorWith('foo', mockProjectPath);

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
    const { generateFile } = await runGeneratorWith(
      'foo',
      mockProjectPath,
      userDefinedArgs,
    );

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
  const generateFile = jest.fn();

  const cg = new ComponentGenerator({
    componentName: name,
    srcPath: normalize('/my/src/path'),
    generateFile,
    appRoot,
    args: { _: [], ...args },
  });

  await cg.run();

  return {
    generateFile,
  };
}
