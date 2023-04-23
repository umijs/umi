import { generateFile } from '@umijs/utils';
import { join, normalize } from 'path';
import { PageGenerator } from './page';

jest.mock('@umijs/utils', () => {
  let originalModule = jest.requireActual('@umijs/utils');

  return {
    __esModule: true,
    ...originalModule,
    generateFile: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('page generator', function () {
  describe('in Non dir Mode', function () {
    it('generate page files page', async () => {
      await expectPageGeneratorArgsMatchesGeneratedFiles(
        { _: ['page', 'foo'], dir: false },
        [
          {
            target: '/pages/foo.tsx',
            path: 'templates/generate/page/index.tsx.tpl',
            name: 'foo',
            baseDir: '/',
          },
          {
            target: '/pages/foo.less',
            path: 'templates/generate/page/index.less.tpl',
            name: 'foo',
            baseDir: '/',
          },
        ],
      );
    });

    it('generate nested folder and page files', async () => {
      await expectPageGeneratorArgsMatchesGeneratedFiles(
        { _: ['page', 'foo/bar'], dir: false },
        [
          {
            target: '/pages/foo/bar.tsx',
            path: 'templates/generate/page/index.tsx.tpl',
            name: 'bar',
            baseDir: '/',
          },
          {
            target: '/pages/foo/bar.less',
            path: 'templates/generate/page/index.less.tpl',
            name: 'bar',
            baseDir: '/',
          },
        ],
      );
    });

    describe('using custom template', () => {
      it('generate page by using custom template', async () => {
        const fixtureDir = join(__dirname, '../../../fixtures/');

        await expectPageGeneratorArgsMatchesGeneratedFiles(
          { _: ['page', 'foo'], dir: false },
          [
            {
              target: '/pages/foo.tsx',
              path: join(fixtureDir, 'templates/page', 'index.tsx.tpl'),
              name: 'foo',
              baseDir: fixtureDir,
            },
            {
              target: '/pages/foo.less',
              path: join(fixtureDir, 'templates/page', 'index.less.tpl'),
              name: 'foo',
              baseDir: fixtureDir,
            },
          ],
          fixtureDir,
        );
      });

      it('generate page with custom variables', async () => {
        const fixtureDir = join(__dirname, '../../../fixtures/');

        await expectPageGeneratorArgsMatchesGeneratedFiles(
          { _: ['page', 'foo'], dir: false, foo: 'bar', count: 1, bool: true },
          [
            {
              target: '/pages/foo.tsx',
              path: join(fixtureDir, 'templates/page', 'index.tsx.tpl'),
              name: 'foo',
              baseDir: fixtureDir,
              data: {
                foo: 'bar',
                count: 1,
                bool: true,
              },
            },
            {
              target: '/pages/foo.less',
              path: join(fixtureDir, 'templates/page', 'index.less.tpl'),
              name: 'foo',
              baseDir: fixtureDir,
              data: {
                foo: 'bar',
                count: 1,
                bool: true,
              },
            },
          ],
          fixtureDir,
        );
      });
    });
  });

  describe('in dir mode', function () {
    it('generate index files in folder', async () => {
      await expectPageGeneratorArgsMatchesGeneratedFiles(
        { _: ['page', 'foo'], dir: true },
        [
          {
            target: '/pages/foo',
            path: 'templates/generate/page',
            name: 'index',
            baseDir: '/',
          },
        ],
      );
    });

    it('generate nested folder and index files', async () => {
      await expectPageGeneratorArgsMatchesGeneratedFiles(
        { _: ['page', 'foo/bar'], dir: true },
        [
          {
            target: '/pages/foo/bar',
            path: 'templates/generate/page',
            name: 'index',
            baseDir: '/',
          },
        ],
      );
    });

    describe('using custom template', () => {
      it('generate index files in folder', async () => {
        const fixtureDir = join(__dirname, '../../../fixtures/');

        await expectPageGeneratorArgsMatchesGeneratedFiles(
          { _: ['page', 'foo'], dir: true },
          [
            {
              target: '/pages/foo',
              path: join(fixtureDir, 'templates/page'),
              name: 'index',
              baseDir: fixtureDir,
            },
          ],
          fixtureDir,
        );
      });

      it('generate page with custom variables', async () => {
        const fixtureDir = join(__dirname, '../../../fixtures/');

        await expectPageGeneratorArgsMatchesGeneratedFiles(
          { _: ['page', 'foo'], dir: true, foo: 'bar', count: 1, bool: true },
          [
            {
              target: '/pages/foo',
              path: join(fixtureDir, 'templates/page'),
              name: 'index',
              baseDir: fixtureDir,
              data: {
                foo: 'bar',
                count: 1,
                bool: true,
              },
            },
          ],
          fixtureDir,
        );
      });
    });
  });

  async function expectPageGeneratorArgsMatchesGeneratedFiles(
    args: { _: string[]; dir: boolean; [key: string]: any },
    fileGenerations: {
      name: string;
      target: string;
      path: string;
      baseDir?: string;
      data?: Record<string, any>;
    }[],
    appCwd?: string,
  ) {
    const g = new PageGenerator({
      absPagesPath: normalize('/pages/'),
      args,
      appCwd: appCwd || normalize('/'),
    });

    await g.run();

    expect(generateFile).toBeCalledTimes(fileGenerations.length);
    for (const [i, f] of fileGenerations.entries()) {
      expect(generateFile).toHaveBeenNthCalledWith(i + 1, {
        data: {
          name: f.name,
          color: expect.anything(),
          importSource: 'umi',
          cssExt: '.less',
          ...(f.data || {}),
        },
        target: normalize(f.target),
        path: expect.stringContaining(normalize(f.path)),
        baseDir: f.baseDir ? normalize(f.baseDir) : undefined,
      });
    }
  }
});

describe('page generate in interactive way', function () {
  it('generate page with default name when no answer', async () => {
    const prompts = jest.fn();

    const g = new PageGenerator({
      absPagesPath: '/pages/',
      args: { _: [] },
      appCwd: '/',
    });

    g.setPrompter(prompts as any);
    prompts.mockResolvedValueOnce({ name: '' });
    prompts.mockResolvedValueOnce({ mode: 'file' });

    await g.run();

    expect(g.getDirMode()).toEqual(false);
    expect(prompts).toBeCalledTimes(2);
    expect(prompts).toHaveBeenNthCalledWith(1, {
      type: 'text',
      name: 'name',
      message: 'What is the name of page?',
      initial: 'unTitledPage',
    });
    expect(prompts).toHaveBeenNthCalledWith(2, {
      type: 'select',
      name: 'mode',
      message: 'How dou you want page files to be created?',
      choices: [
        { title: normalize('unTitledPage/index.{tsx,less}'), value: 'dir' },
        { title: normalize('unTitledPage.{tsx,less}'), value: 'file' },
      ],
      initial: 0,
    });
  });

  it('generate index page when answer file name', async () => {
    const prompts = jest.fn();
    const g = new PageGenerator({
      absPagesPath: '/pages/',
      args: { _: [] },
      appCwd: '/',
    });

    g.setPrompter(prompts as any);
    prompts.mockResolvedValueOnce({ name: 'aaa/bbb' });
    prompts.mockResolvedValueOnce({ mode: 'dir' });

    await g.run();

    expect(g.getDirMode()).toEqual(true);
    expect(prompts).toBeCalledTimes(2);
    expect(prompts).toHaveBeenNthCalledWith(1, {
      type: 'text',
      name: 'name',
      message: 'What is the name of page?',
      initial: 'unTitledPage',
    });
    expect(prompts).toHaveBeenNthCalledWith(2, {
      type: 'select',
      name: 'mode',
      message: 'How dou you want page files to be created?',
      choices: [
        { title: normalize('aaa/bbb/index.{tsx,less}'), value: 'dir' },
        { title: normalize('aaa/bbb.{tsx,less}'), value: 'file' },
      ],
      initial: 0,
    });
  });

  it('generate page with trimmed file name', async () => {
    const prompts = jest.fn();
    const g = new PageGenerator({
      absPagesPath: '/pages/',
      args: { _: [] },
      appCwd: '/',
    });

    g.setPrompter(prompts as any);
    prompts.mockResolvedValueOnce({ name: ' aPageName ' });
    prompts.mockResolvedValueOnce({ mode: 'dir' });

    await g.run();

    expect(generateFile).toHaveBeenNthCalledWith(1, targetTo('aPageName'));
  });

  it('generate default page with blank input', async () => {
    const prompts = jest.fn();
    const g = new PageGenerator({
      absPagesPath: '/pages/',
      args: { _: [] },
      appCwd: '/',
    });

    g.setPrompter(prompts as any);
    prompts.mockResolvedValueOnce({ name: ' ' });
    prompts.mockResolvedValueOnce({ mode: 'dir' });

    await g.run();

    expect(generateFile).toHaveBeenNthCalledWith(1, targetTo('unTitledPage'));
  });
});

describe('page generate multi pages in a run', function () {
  it('can generate multi pages in dir mode', async () => {
    const g = new PageGenerator({
      absPagesPath: normalize('/pages/'),
      args: { dir: true, _: ['page', 'login', 'post'] },
      appCwd: '/',
    });

    await g.run();

    expect(generateFile).toBeCalledTimes(2);
    expect(generateFile).toHaveBeenNthCalledWith(1, targetTo('login'));
    expect(generateFile).toHaveBeenNthCalledWith(2, targetTo('post'));
  });

  it('can generate multi pages in non-dir mode', async () => {
    const g = new PageGenerator({
      absPagesPath: normalize('/pages/'),
      args: { dir: false, _: ['page', 'login', 'post'] },
      appCwd: '/',
    });

    await g.run();

    expect(generateFile).toBeCalledTimes(4);

    expect(generateFile).toHaveBeenNthCalledWith(1, targetTo('login.tsx'));
    expect(generateFile).toHaveBeenNthCalledWith(2, targetTo('login.less'));
    expect(generateFile).toHaveBeenNthCalledWith(3, targetTo('post.tsx'));
    expect(generateFile).toHaveBeenNthCalledWith(4, targetTo('post.less'));
  });
});

function targetTo(f: string) {
  return expect.objectContaining({
    target: expect.stringContaining(f),
  });
}
