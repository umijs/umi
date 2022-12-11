import { prompts, fsExtra, generateFile } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import rimraf from 'rimraf';
import { TEMPLATES_DIR } from '../../constants';
import { ETempDir, processGenerateFiles, tryEject } from './utils';

jest.mock('@umijs/utils', () => {
  let originalModule = jest.requireActual('@umijs/utils');

  return {
    __esModule: true,
    ...originalModule,
    generateFile: jest.fn(),
  };
});

describe('processGenerateFile', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks().clearAllMocks();
  });

  const fallbackPath = join(TEMPLATES_DIR, 'generate/page');
  const userDefinedPage = join(__dirname, '../../../fixtures/templates/page');
  const fromPath = 'not-exist-from-path';
  const toPath = 'not-exist-to-path.tsx';

  it('should use fallback template if no user defined', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: fromPath,
          fromFallback: fallbackPath,
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {},
      presetArgs: {
        fallback: false,
      },
    });

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: fallbackPath,
      baseDir: '/',
    });
  });

  it('should use user defined template', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: userDefinedPage,
          fromFallback: fallbackPath,
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {},
    });

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: userDefinedPage,
      baseDir: '/',
    });
  });

  it('should pass user defined variables to template', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: userDefinedPage,
          fromFallback: fallbackPath,
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
    });

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

  it('should use fallback template file if user defined template is not same with default template', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: join(
            __dirname,
            '../../../fixtures/templates',
            'pageNoIndex/index.tsx.tpl',
          ),
          fromFallback: join(fallbackPath, 'index.tsx.tpl'),
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
    });

    expect(generateFile).toBeCalledWith({
      data: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
      target: toPath,
      path: join(fallbackPath, 'index.tsx.tpl'),
      baseDir: '/',
    });
  });

  it('should use fallback template if not has same struct with default template', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: join(__dirname, '../../../fixtures/templates', 'emptyPage'),
          fromFallback: fallbackPath,
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
    });

    expect(generateFile).toHaveBeenCalledWith({
      data: {
        foo: 'bar',
        count: 1,
        baz: true,
      },
      target: toPath,
      path: fallbackPath,
      baseDir: '/',
    });
  });

  it('should use fallback template if specify --fallback', async () => {
    await processGenerateFiles({
      filesMap: [
        {
          from: userDefinedPage,
          fromFallback: fallbackPath,
          to: toPath,
        },
      ],
      baseDir: '/',
      templateVars: {},
      presetArgs: {
        fallback: true,
      },
    });

    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: fallbackPath,
      baseDir: '/',
    });
  });

  const mockProjectDir = join(__dirname, '../../../fixtures/emptyPage');

  it('support tsx, ts in order ', async () => {
    const tsxPath = join(mockProjectDir, 'index.tsx');
    const tsPath = join(mockProjectDir, 'index.ts');
    fsExtra.ensureFileSync(tsxPath);
    fsExtra.ensureFileSync(tsPath);

    const run = async () =>
      processGenerateFiles({
        filesMap: [
          {
            from: join(mockProjectDir, 'index'),
            fromFallback: fallbackPath,
            to: toPath,
            exts: ['.tsx', '.ts'],
          },
        ],
        baseDir: '/',
        templateVars: {},
      });

    await run();
    expect(generateFile).toBeCalledWith({
      data: {},
      target: toPath,
      path: tsxPath,
      baseDir: '/',
    });

    rimraf.sync(tsxPath);
    await run();
    expect(generateFile).toBeCalledWith({
      data: {},
      target: 'not-exist-to-path.ts',
      path: tsPath,
      baseDir: '/',
    });

    fsExtra.emptyDirSync(mockProjectDir);
  });

  it('can eject default template to user dir', async () => {
    await tryEject(ETempDir.Page, mockProjectDir);
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
    await tryEject(ETempDir.Page, mockProjectDir);
    expect(
      existsSync(join(mockProjectDir, 'templates/pages/index.less.tpl')),
    ).toBe(false);
    prompts.inject([true]);
    await tryEject(ETempDir.Page, mockProjectDir);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.tsx.tpl')),
    ).toBe(true);
    expect(
      existsSync(join(mockProjectDir, 'templates/page/index.less.tpl')),
    ).toBe(true);

    fsExtra.emptydirSync(mockProjectDir);
  });

  it('should not cover other files in same user dir', async () => {
    const customPath = join(mockProjectDir, 'templates/page/custom.tsx.tpl');
    fsExtra.ensureFileSync(customPath);
    prompts.inject([true]);
    await tryEject(ETempDir.Page, mockProjectDir);
    expect(existsSync(customPath)).toBe(true);

    fsExtra.emptydirSync(mockProjectDir);
  });
});
