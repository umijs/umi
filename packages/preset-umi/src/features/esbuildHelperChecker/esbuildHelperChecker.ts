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
    throw new Error(
      `Found conflicts in esbuild helpers: ${conflicts.join(
        ', ',
      )}, please set esbuildMinifyIIFE: true in your config file.`,
    );
  }
  logger.info(`[esbuildHelperChecker] No conflicts found.`);
}

export async function getGlobalVars(opts: { content: string }) {
  const ast = parser.parse(opts.content, {
    sourceType: 'module',
    sourceFilename: 'foo.js',
    plugins: [],
  });
  const vars: string[] = [];
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
    if (process.env.OKAM) return;
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
