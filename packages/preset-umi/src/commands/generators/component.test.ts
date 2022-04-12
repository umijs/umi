import { normalize } from 'path';
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

async function runGeneratorWith(name: string) {
  const generateFile = jest.fn();

  const cg = new ComponentGenerator({
    componentName: name,
    srcPath: normalize('/my/src/path'),
    generateFile,
    appRoot: normalize('/my'),
  });

  await cg.run();

  return {
    generateFile,
  };
}
