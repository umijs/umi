import assert from 'assert';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import execa from 'execa';
import ora from 'ora';
import { merge } from 'lodash';
import clipboardy from 'clipboardy';
import { getParsedData, makeSureMaterialsTempPathExist } from './download';
import writeNewRoute from '../../../utils/writeNewRoute';
import { dependenciesConflictCheck, getNameFromPkg } from './getBlockGenerator';

export default api => {
  const { log, paths, debug, applyPlugins } = api;

  async function generate(args = {}) {
    const spinner = ora();

    // 1. parse url and args
    spinner.start('Parse url and args');
    const url = args._[0];
    assert(
      url,
      `run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
    );
    debug(`get url ${url}`);

    const useYarn = existsSync(join(paths.cwd, 'yarn.lock'));
    const defaultNpmClient = useYarn ? 'yarn' : 'npm';
    debug(`defaultNpmClient: ${defaultNpmClient}`);

    debug(`args: ${JSON.stringify(args)}`);
    const {
      path,
      npmClient = defaultNpmClient,
      dryRun,
      skipDependencies,
      skipModifyRoutes,
    } = args;

    const ctx = getParsedData(url);
    if (!ctx.isLocal) {
      const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);
      const templateTmpDirPath = join(blocksTempPath, ctx.id);

      merge(ctx, {
        sourcePath: join(templateTmpDirPath, ctx.path),
        branch: args.branch || ctx.branch,
        templateTmpDirPath,
        blocksTempPath,
        repoExists: existsSync(templateTmpDirPath),
      });
    }

    // make sure sourcePath exists
    assert(existsSync(ctx.sourcePath), `${ctx.sourcePath} don't exists`);

    // get block's package.json
    const pkgPath = join(ctx.sourcePath, 'package.json');
    if (!existsSync(pkgPath)) {
      throw new Error(`not find package.json in ${this.sourcePath}`);
    } else {
      // eslint-disable-next-line
      ctx.pkg = require(pkgPath);
    }

    // setup route path
    if (!path) {
      const pkgName = getNameFromPkg(ctx.pkg);
      if (!pkgName) {
        return log.error("not find name in block's package.json");
      }
      ctx.routePath = `/${pkgName}`;
    } else {
      ctx.routePath = path;
    }
    // fix demo => /demo
    if (!/^\//.test(ctx.routePath)) {
      ctx.routePath = `/${ctx.routePath}`;
    }
    spinner.succeed();

    // 2. clone git repo
    if (!ctx.isLocal && !ctx.repoExists) {
      spinner.start('Clone git repo');
      try {
        await execa(
          `git`,
          [`clone`, ctx.repo, ctx.id, `--single-branch`, `-b`, ctx.branch],
          {
            cwd: ctx.blocksTempPath,
            env: process.env,
          },
        );
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    // 3. update git repo
    if (!ctx.isLocal && ctx.repoExists) {
      spinner.start('Git fetch');
      try {
        await execa(`git`, ['fetch'], {
          cwd: ctx.templateTmpDirPath,
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();

      spinner.start(`Git checkout ${ctx.branch}`);
      try {
        await execa(`git`, ['checkout', ctx.branch], {
          cwd: ctx.templateTmpDirPath,
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();

      spinner.start('Git pull');
      try {
        await execa(`git`, [`pull`], {
          cwd: ctx.templateTmpDirPath,
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    // 4. install additional dependencies
    // check dependencies conflict and install dependencies
    if (skipDependencies) {
      debug('skip dependencies');
    } else {
      // read project package.json
      const projectPkgPath = applyPlugins('_modifyBlockPackageJSONPath', {
        initialValue: join(paths.cwd, 'package.json'),
      });
      assert(
        existsSync(projectPkgPath),
        `No package.json found in your project`,
      );
      // eslint-disable-next-line
      const projectPkg = require(projectPkgPath);

      // get confilict dependencies and lack dependencies
      const { conflicts, lacks } = applyPlugins('_modifyBlockDependencies', {
        initialValue: dependenciesConflictCheck(
          ctx.pkg.dependencies,
          projectPkg.dependencies,
        ),
      });
      debug(`conflictDeps ${conflicts}, lackDeps ${lacks}`);

      // find confilict dependencies throw error
      if (conflicts.length) {
        throw new Error(`
  find dependencies conflict between block and your project:
  ${conflicts
    .map(info => {
      return `* ${info[0]}: ${info[2]}(your project) not compatible with ${
        info[1]
      }(block)`;
    })
    .join('\n')}`);
      }

      // find lack confilict, auto install
      if (dryRun) {
        debug('dryRun is true, skip install dependencies');
      } else if (lacks.length) {
        const deps = lacks.map(dep => `${dep[0]}@${dep[1]}`);
        spinner.start(
          `Install additional dependencies ${deps.join(',')} with ${npmClient}`,
        );
        try {
          await execa(
            npmClient,
            npmClient.includes('yarn')
              ? ['add', ...deps]
              : ['install', ...deps, '--save'],
            {
              cwd: dirname(projectPkgPath),
            },
          );
        } catch (e) {
          spinner.fail();
          throw new Error(e);
        }
        spinner.succeed();
      }
    }

    // 5. run generator
    spinner.start(`Generate files`);
    spinner.stopAndPersist();
    const BlockGenerator = require('./getBlockGenerator').default(api);
    try {
      const generator = new BlockGenerator(args._.slice(1), {
        sourcePath: ctx.sourcePath,
        path: ctx.routePath,
        dryRun,
        env: {
          cwd: api.cwd,
        },
        resolved: __dirname,
      });
      await generator.run();
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed('Generate files');

    // 6. write routes
    if (api.config.routes && !skipModifyRoutes) {
      spinner.start(
        `Write route ${ctx.routePath} to ${api.service.userConfig.file}`,
      );
      // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
      // 未来可以做下自动写入注释配置，支持约定式路由
      const newRouteConfig = applyPlugins('_modifyBlockNewRouteConfig', {
        initialValue: {
          path: ctx.routePath.toLowerCase(),
          component: `.${ctx.routePath}`,
        },
      });
      try {
        writeNewRoute(
          newRouteConfig,
          api.service.userConfig.file,
          paths.absSrcPath,
        );
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    // Final: show success message
    const viewUrl = `http://localhost:${process.env.PORT ||
      '8000'}${ctx.routePath.toLowerCase()}`;
    clipboardy.writeSync(viewUrl);
    log.success(
      `probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
        '(copied to clipboard)',
      )} for view the block.`,
    );
  }

  const details = `
Examples:

  ${chalk.gray('# get block `demo` which in umi official blocks')}
  umi block https://github.com/umijs/umi-blocks/tree/master/demo

  umi block demo ${chalk.gray('# a shortcut command')}

  umi block demo --path /users/settings/profile ${chalk.gray(
    '# add route to the layout',
  )}
  `.trim();

  api.registerCommand(
    'block',
    {
      description: 'get block',
      usage: `umi block <a github/gitlab/gitrepo url> [options]`,
      options: {
        '--path': "path name, default is name in block's package.json",
        '--branch':
          'git branch, this usually does not need when you use a github url with branch itself',
        '--dry-run':
          'for test, block would have done without actually installing and download anything',
        '--npm-client':
          'use special npm client, default is npm or yarn(when yarn.lock exist in you project)',
        '--skip-dependencies':
          'skip block dependencies install and conflict check',
        '--skip-modify-routes':
          'skip modify routes when you use conventional routes',
      },
      details,
    },
    args => {
      generate(args).catch(e => {
        log.error(e);
      });
    },
  );
};
