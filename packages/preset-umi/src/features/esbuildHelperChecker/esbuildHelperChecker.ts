import * as parser from '@umijs/bundler-utils/compiled/babel/parser';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { chalk, logger } from '@umijs/utils';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { IApi } from '../../types';

async function checkDir(opts: { dir: string }) {
  logger.info(
    `[esbuildHelperChecker] Checking esbuild helpers from your dist files...`,
  );
  const jsFiles = fs
    .readdirSync(opts.dir)
    .filter((file) => file.endsWith('.js'));
  const varMap: Record<string, string[]> = {};
  for (const jsFile of jsFiles) {
    const vars = await getGlobalVars({
      content: fs.readFileSync(path.join(opts.dir, jsFile), 'utf-8'),
      fileName: jsFile,
    });
    for (const v of vars) {
      varMap[v] = varMap[v] || [];
      varMap[v].push(jsFile);
    }
  }
  const conflicts = Object.keys(varMap)
    .filter((v) => varMap[v].length > 1)
    .map((v) => `${v} (${varMap[v].join(', ')})`);
  if (conflicts.length) {
    logger.fatal(
      chalk.yellow(
        `Found conflicts in esbuild helpers: ${conflicts.join(', ')}`,
      ),
    );
    logger.info(
      `please set ${chalk.blue('esbuildMinifyIIFE: true')} in your config file`,
    );
    throw new Error(`Found conflicts in esbuild helpers.`);
  }
  logger.info(`[esbuildHelperChecker] No conflicts found.`);
}

export async function getGlobalVars(opts: {
  content: string;
  fileName: string;
}) {
  const vars: string[] = [];
  /**
   * 产物目录可能会有用户自定义的非标准 js 文件，会导致 parse 异常，这里转为 error 提示，不中断程序
   * eg. git lfs 会生成不符合 js 规范的 js 文件
   */
  try {
    const ast = parser.parse(opts.content, {
      sourceType: 'module',
      sourceFilename: 'foo.js',
      plugins: [],
    });
    ast.program.body.forEach((node) => {
      if (t.isVariableDeclaration(node)) {
        node.declarations.forEach((declaration) => {
          if (t.isVariableDeclarator(declaration)) {
            if (t.isIdentifier(declaration.id)) {
              vars.push(declaration.id.name);
            }
          }
        });
      }
    });
  } catch (error: any) {
    logger.error(
      `[esbuildHelperChecker] Failed to parse ${opts.fileName}, ${error.message}`,
    );
  }
  return vars;
}

export default (api: IApi) => {
  api.registerCommand({
    name: 'esbuildHelperChecker',
    description: 'check esbuild helper conflicts',
    configResolveMode: 'loose',
    async fn({ args }) {
      const targetDir = args._[0];
      assert(targetDir, 'target directory is required');
      await checkDir({
        dir: path.resolve(process.cwd(), targetDir),
      });
    },
  });

  api.onBuildComplete(async ({ err }) => {
    if (api.config.vite || api.config.mako) return;
    if (err) return;
    const jsMinifier = api.config.jsMinifier || 'esbuild';
    if (jsMinifier !== 'esbuild') return;
    if (api.config.esbuildMinifyIIFE) return;
    if (process.env.COMPRESS === 'none') return;
    try {
      await checkDir({
        dir: api.paths.absOutputPath,
      });
    } catch (e: any) {
      logger.fatal(chalk.red(`[esbuildHelperChecker] ${e.message}`));
      process.exit(1);
    }
  });
};
