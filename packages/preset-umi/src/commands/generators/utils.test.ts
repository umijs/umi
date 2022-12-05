import { prompts, fsExtra } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { processGenerateFile, tryEject } from './utils';

describe('processGenerateFile', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const fallbackPath = join(TEMPLATES_DIR, 'generate/page');
  const userDefinedPage = join(__dirname, '../../../fixtures/templates/page');
  const fromPath = 'not-exist-from-path';
  const toPath = 'not-exist-to-path';

  it('should use fallback template if no user defined', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    await processGenerateFile(
      {
        fromToMapping: [
          {
            from: fromPath,
            fromFallback: fallbackPath,
            to: toPath,
          },
        ],
        baseDir: '/',
        data: {},
        args: {
          _: [],
        },
      },
      generateFile,
    );

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: fallbackPath,
      baseDir: '/',
    });
  });

  it('should use user defined template', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    await processGenerateFile(
      {
        fromToMapping: [
          {
            from: userDefinedPage,
            fromFallback: fallbackPath,
            to: toPath,
          },
        ],
        baseDir: '/',
        data: {},
        args: {
          _: [],
        },
      },
      generateFile,
    );

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: userDefinedPage,
      baseDir: '/',
    });
  });

  it('should pass user defined variables to template', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    await processGenerateFile(
      {
        fromToMapping: [
          {
            from: userDefinedPage,
            fromFallback: fallbackPath,
            to: toPath,
          },
        ],
        baseDir: '/',
        data: {},
        args: {
          _: [],
          foo: 'bar',
          count: 1,
          baz: true,
        },
      },
      generateFile,
    );

    expect(generateFile).toBeCalledWith({
      data: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
      target: toPath,
      path: userDefinedPage,
      baseDir: '/',
    });
  });

  it('should use fallback template if user defined template is not same with default template', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    const paths = [
      'pageNoIndex/index.less.tpl',
      'pageNoLess/index.tsx.tpl',
    ].map((subPath) => join(__dirname, '../../../fixtures/templates', subPath));

    await processGenerateFile(
      {
        fromToMapping: paths.map((from) => ({
          from,
          fromFallback: fallbackPath,
          to: toPath,
        })),
        baseDir: '/',
        data: {},
        args: {
          _: [],
          foo: 'bar',
          count: 1,
          baz: true,
        },
      },
      generateFile,
    );

    expect(generateFile).toHaveBeenCalledTimes(2);

    for (let i = 1; i < 3; i++) {
      expect(generateFile).toHaveBeenNthCalledWith(i, {
        data: {
          foo: 'bar',
          count: 1,
          baz: true,
        },
        target: toPath,
        path: fallbackPath,
        baseDir: '/',
      });
    }
  });

  it('should use fallback template if not has same struct with default template', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    const paths = ['pageNoIndex', 'pageNoLess', 'emptyPage'].map((subPath) =>
      join(__dirname, '../../../fixtures/templates', subPath),
    );

    await processGenerateFile(
      {
        fromToMapping: paths.map((from) => ({
          from,
          fromFallback: fallbackPath,
          to: toPath,
        })),
        baseDir: '/',
        data: {},
        args: {
          _: [],
          foo: 'bar',
          count: 1,
          baz: true,
        },
      },
      generateFile,
    );

    expect(generateFile).toHaveBeenCalledTimes(3);

    for (let i = 1; i < 4; i++) {
      expect(generateFile).toHaveBeenNthCalledWith(i, {
        data: {
          foo: 'bar',
          count: 1,
          baz: true,
        },
        target: toPath,
        path: fallbackPath,
        baseDir: '/',
      });
    }
  });

  it('should use fallback template if specify --fallback', async () => {
    const generateFile = jest.fn().mockResolvedValue(null);
    await processGenerateFile(
      {
        fromToMapping: [
          {
            from: userDefinedPage,
            fromFallback: fallbackPath,
            to: toPath,
          },
        ],
        baseDir: '/',
        data: {},
        args: {
          _: [],
          fallback: true,
        },
      },
      generateFile,
    );

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: fallbackPath,
      baseDir: '/',
    });
  });

  const mockProjectDir = join(__dirname, '../../../fixtures/emptyPage');

  it('can eject default template to user dir', async () => {
    await tryEject('page', mockProjectDir);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.tsx.tpl')),
    ).toBe(true);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.less.tpl')),
    ).toBe(true);

    fsExtra.emptydirSync(mockProjectDir);
  });

  it('should show prompts if user dir has conflict with [*.tpl] file', async () => {
    const customPath = join(mockProjectDir, 'templates/page/index.tsx.tpl');
    fsExtra.ensureFileSync(customPath);
    prompts.inject([false]);
    await tryEject('page', mockProjectDir);
    expect(
      existsSync(join(mockProjectDir, 'templates/pages/index.less.tpl')),
    ).toBe(false);
    prompts.inject([true]);
    await tryEject('page', mockProjectDir);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.tsx.tpl')),
    ).toBe(true);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.less.tpl')),
    ).toBe(true);

    fsExtra.emptydirSync(mockProjectDir);
  });

  xit('should not cover other files in same user dir', async () => {
    const customPath = join(mockProjectDir, 'templates/page/custom.tsx.tpl');
    fsExtra.ensureFileSync(customPath);
    prompts.inject([true]);
    await tryEject('page', mockProjectDir);
    expect(existsSync(customPath)).toBe(true);

    fsExtra.emptydirSync(mockProjectDir);
  });
});
