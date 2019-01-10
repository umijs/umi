import assert from 'assert';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import execa from 'execa';
import ora from 'ora';
import { merge } from 'lodash';
import clipboardy from 'clipboardy';
import { getParsedData, makeSureMaterialsTempPathExist } from './download';
import writeNewRoute from '../../../utils/writeNewRoute';
import { dependenciesConflictCheck, getNameFromPkg, getMockDependencies } from './getBlockGenerator';

export default api => {
  const { log, paths, debug, applyPlugins } = api;

  async function block(args = {}) {
    switch (args._[0]) {
      case 'add':
        await add(args);
        break;
      case 'list':
        await list(args);
        break;
      default:
        throw new Error(
          `Please run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
        );
    }
  }

  function printBlocks(blocks, parentPath = '') {
    blocks.forEach(block => {
      if (block.type === 'block') {
        console.log(`    ${chalk.cyan(join(parentPath, block.path))}`);
      }
      if (block.type === 'dir') {
        printBlocks(block.blocks, block.path);
      }
    });
  }

  async function list() {
    const got = require('got');
    const { body } = await got(`http://blocks.umijs.org/api/blocks`);
    const { status, error, data } = JSON.parse(body);
    if (status === 'success') {
      console.log(``);
      console.log(`  Blocks:`);
      console.log(``);
      printBlocks(data);
      console.log(``);
    } else {
      throw new Error(error);
    }
  }

  function getCtx(url, args = {}) {
    debug(`get url ${url}`);

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

    return ctx;
  }

  async function gitUpdate(ctx, spinner) {
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

  async function gitClone(ctx, spinner) {
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

  async function add(args = {}) {
    const spinner = ora();

    // 1. parse url and args
    spinner.start('Parse url and args');
    const url = args._[1];
    assert(
      url,
      `run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
    );

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
    const ctx = getCtx(url);
    spinner.succeed();

    // 2. clone git repo
    if (!ctx.isLocal && !ctx.repoExists) {
      await gitClone(ctx, spinner);
    }

    // 3. update git repo
    if (!ctx.isLocal && ctx.repoExists) {
      await gitUpdate(ctx, spinner);
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

      // get _mock.js dependencie
      let devDependencies = {};
      const mockFilePath = join(ctx.sourcePath, 'src/_mock.js');
      if (existsSync(mockFilePath)) {
        devDependencies = getMockDependencies(readFileSync(mockFilePath, 'utf-8'), ctx.pkg);
      }
      // get confilict dependencies and lack dependencies
      const { conflicts, lacks, devConflicts, devLacks } = applyPlugins('_modifyBlockDependencies', {
        initialValue: dependenciesConflictCheck(
          ctx.pkg.dependencies,
          projectPkg.dependencies,
          devDependencies,
          {
            ...projectPkg.devDependencies,
            ...projectPkg.dependencies,
          },
        ),
      });
      debug(`conflictDeps ${conflicts}, lackDeps ${lacks}`, `devConflictDeps ${devConflicts}, devLackDeps ${devLacks}`);

      // find confilict dependencies throw error
      const allConflicts = [
        ...conflicts,
        ...devConflicts,
      ];
      if (allConflicts.length) {
        throw new Error(`
  find dependencies conflict between block and your project:
  ${allConflicts
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
      } else {
        if (lacks.length) {
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

        if (devLacks.length) {
          // need skip devDependency which already install in dependencies
          const devDeps = devLacks
            .filter(dep => !lacks.find(item => item[0] === dep[0]))
            .map(dep => `${dep[0]}@${dep[1]}`);
          spinner.start(
            `Install additional devDependencies ${devDeps.join(',')} with ${npmClient}`,
          );
          try {
            await execa(
              npmClient,
              npmClient.includes('yarn')
                ? ['add', ...devDeps, '--dev']
                : ['install', ...devDeps, '--save-dev'],
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
    }

    // 5. run generator
    spinner.start(`Generate files`);
    spinner.stopAndPersist();
    const BlockGenerator = require('./getBlockGenerator').default(api);
    const generator = new BlockGenerator(args._.slice(2), {
      sourcePath: ctx.sourcePath,
      path: ctx.routePath,
      dryRun,
      env: {
        cwd: api.cwd,
      },
      resolved: __dirname,
    });
    try {
      await generator.run();
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed('Generate files');

    // 6. write routes
    if (api.config.routes && !skipModifyRoutes) {
      spinner.start(
        `Write route ${generator.path} to ${api.service.userConfig.file}`,
      );
      // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
      // 未来可以做下自动写入注释配置，支持约定式路由
      const newRouteConfig = applyPlugins('_modifyBlockNewRouteConfig', {
        initialValue: {
          path: generator.path.toLowerCase(),
          component: `.${generator.path}`,
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
      '8000'}${generator.path.toLowerCase()}`;
    try {
      clipboardy.writeSync(viewUrl);
      log.success(
        `probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
          '(copied to clipboard)',
        )} for view the block.`,
      );
    } catch (e) {
      log.success(
        `probable url ${chalk.cyan(viewUrl)} for view the block.`,
      );
      log.error('copy to clipboard failed');
    }
  }

  const details = `

Commands:

  ${chalk.cyan(`add `)}     add a block to your project
  ${chalk.cyan(`list`)}     list all blocks

Options for the ${chalk.cyan(`add`)} command:

  ${chalk.green(`--path              `)} the route path, default the name in package.json
  ${chalk.green(`--branch            `)} git branch
  ${chalk.green(`--npm-client        `)} the npm client, default npm or yarn (if has yarn.lock)
  ${chalk.green(`--skip-dependencies `)} don't install dependencies
  ${chalk.green(`--skip-modify-routes`)} don't modify the routes
  ${chalk.green(`--dry-run           `)} for test, don't install dependencies and download

Examples:

  ${chalk.gray(`# Add block`)}
  umi block add demo
  umi block add ant-design-pro/Monitor

  ${chalk.gray(`# Add block with full url`)}
  umi block add https://github.com/umijs/umi-blocks/tree/master/demo

  ${chalk.gray(`# Add block with specified route path`)}
  umi block add demo --path /foo/bar

  ${chalk.gray(`# List all blocks`)}
  umi list
  `.trim();

  api.registerCommand(
    'block',
    {
      description: 'block related commands, e.g. add, list',
      usage: `umi block <command>`,
      details,
    },
    args => {
      block(args).catch(e => {
        log.error(e);
      });
    },
  );
};
