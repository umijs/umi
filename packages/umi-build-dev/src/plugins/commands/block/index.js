import assert from 'assert';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import ora from 'ora';
import { merge, isPlainObject } from 'lodash';
import getNpmRegistry from 'getnpmregistry';
import clipboardy from 'clipboardy';
import { getParsedData, makeSureMaterialsTempPathExist } from './download';
import writeNewRoute from '../../../utils/writeNewRoute';
import { getNameFromPkg } from './getBlockGenerator';
import appendBlockToContainer from './appendBlockToContainer';
import { gitClone, gitUpdate, getDefaultBlockList, installDependencies } from './util';
import tsToJs from './tsTojs';

export default api => {
  const { log, paths, debug, applyPlugins, config } = api;
  const blockConfig = config.block || {};

  debug(`blockConfig ${blockConfig}`);

  async function block(args = {}) {
    let retCtx;
    switch (args._[0]) {
      case 'add':
        retCtx = await add(args);
        break;
      case 'list':
        await getDefaultBlockList(args);
        break;
      default:
        throw new Error(
          `Please run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
        );
    }
    return retCtx; // return for test
  }

  function getCtx(url, args = {}) {
    debug(`get url ${url}`);

    const ctx = getParsedData(url, blockConfig);

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
    } else {
      merge(ctx, {
        templateTmpDirPath: dirname(url),
      });
    }

    return ctx;
  }

  async function add(args = {}) {
    const spinner = ora();

    // 1. parse url and args
    spinner.start('😁 Parse url and args');
    const url = args._[1];
    assert(url, `run ${chalk.cyan.underline('umi help block')} to checkout the usage`);

    const useYarn = existsSync(join(paths.cwd, 'yarn.lock'));
    const defaultNpmClient = blockConfig.npmClient || (useYarn ? 'yarn' : 'npm');
    debug(`defaultNpmClient: ${defaultNpmClient}`);
    debug(`args: ${JSON.stringify(args)}`);

    // get faster registry url
    const registryUrl = await getNpmRegistry();

    const {
      path,
      npmClient = defaultNpmClient,
      dryRun,
      skipDependencies,
      skipModifyRoutes,
      page: isPage,
      layout: isLayout,
      registry = registryUrl,
      js,
    } = args;

    const ctx = getCtx(url, args);

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
      const blockName = getNameFromPkg(ctx.pkg);
      if (!blockName) {
        return log.error("not find name in block's package.json");
      }
      ctx.routePath = `/${blockName}`;
      log.info(`Not find --path, use block name '${ctx.routePath}' as the target path.`);
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
      // install
      spinner.start(`📦 install dependencies package`);
      await installDependencies(
        { npmClient, registry, applyPlugins, paths, debug, dryRun, spinner },
        ctx,
      );
      spinner.stopAndPersist();
    }

    // 5. run generator
    spinner.start(`🔥 Generate files`);
    spinner.stopAndPersist();
    const BlockGenerator = require('./getBlockGenerator').default(api);
    let isPageBlock = ctx.pkg.blockConfig && ctx.pkg.blockConfig.specVersion === '0.1';
    if (isPage !== undefined) {
      // when user use `umi block add --page`
      isPageBlock = isPage;
    }
    debug(`isPageBlock: ${isPageBlock}`);
    const generator = new BlockGenerator(args._.slice(2), {
      sourcePath: ctx.sourcePath,
      path: ctx.routePath,
      blockName: getNameFromPkg(ctx.pkg),
      isPageBlock,
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

    // write dependencies
    if (ctx.pkg.blockConfig && ctx.pkg.blockConfig.dependencies) {
      const subBlocks = ctx.pkg.blockConfig.dependencies;
      try {
        await Promise.all(
          subBlocks.map(block => {
            const subBlockPath = join(ctx.templateTmpDirPath, block);
            debug(`subBlockPath: ${subBlockPath}`);
            return new BlockGenerator(args._.slice(2), {
              sourcePath: subBlockPath,
              path: isPageBlock ? generator.path : join(generator.path, generator.blockFolderName),
              // eslint-disable-next-line
              blockName: getNameFromPkg(require(join(subBlockPath, 'package.json'))),
              isPageBlock: false,
              dryRun,
              env: {
                cwd: api.cwd,
              },
              resolved: __dirname,
            }).run();
          }),
        );
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
    }
    spinner.succeed();

    // 调用 sylvanas 转化 ts
    if (js) {
      spinner.start('🤔 TypeScript to JavaScript');
      tsToJs(generator.blockFolderPath);
      spinner.succeed();
    }

    // 6. write routes
    if (generator.needCreateNewRoute && api.config.routes && !skipModifyRoutes) {
      spinner.start(`🧐  Write route ${generator.path} to ${api.service.userConfig.file}`);
      // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
      // 未来可以做下自动写入注释配置，支持约定式路由
      const newRouteConfig = applyPlugins('_modifyBlockNewRouteConfig', {
        initialValue: {
          path: generator.path.toLowerCase(),
          component: `.${generator.path}`,
          ...(isLayout ? { routes: [] } : {}),
        },
      });
      try {
        if (!dryRun) {
          writeNewRoute(newRouteConfig, api.service.userConfig.file, paths.absSrcPath);
        }
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    // 6. import block to container
    if (!generator.isPageBlock) {
      spinner.start(
        `Write block component ${generator.blockFolderName} import to ${generator.entryPath}`,
      );
      try {
        appendBlockToContainer({
          entryPath: generator.entryPath,
          blockFolderName: generator.blockFolderName,
          dryRun,
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    // Final: show success message
    const viewUrl = `http://localhost:${process.env.PORT || '8000'}${generator.path.toLowerCase()}`;
    try {
      clipboardy.writeSync(viewUrl);
      log.success(
        `probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
          '(copied to clipboard)',
        )} for view the block.`,
      );
    } catch (e) {
      log.success(`probable url ${chalk.cyan(viewUrl)} for view the block.`);
      log.error('copy to clipboard failed');
    }

    return {
      generator,
      ctx,
    }; // return ctx and generator for test
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
  ${chalk.green(`--page              `)} add the block to a independent directory as a page
  ${chalk.green(`--layout            `)} add as a layout block (add route with empty children)
  ${chalk.green(`--js            `)} If the block is typescript, convert to js
  ${chalk.green(`--registry            `)} set up npm installation using the registry

Examples:

  ${chalk.gray(`# Add block`)}
  umi block add demo
  umi block add ant-design-pro/Monitor

  ${chalk.gray(`# Add block with full url`)}
  umi block add https://github.com/umijs/umi-blocks/tree/master/demo

  ${chalk.gray(`# Add block with specified route path`)}
  umi block add demo --path /foo/bar

  ${chalk.gray(`# List all blocks`)}
  umi block list
  `.trim();

  api.registerCommand(
    'block',
    {
      description: 'block related commands, e.g. add, list',
      usage: `umi block <command>`,
      details,
    },
    args => {
      // reture only for test
      return block(args).catch(e => {
        log.error(e);
      });
    },
  );

  api._registerConfig(() => {
    return () => {
      return {
        name: 'block',
        validate(val) {
          assert(
            isPlainObject(val),
            `Configure item block should be Plain Object, but got ${val}.`,
          );
        },
      };
    };
  });
};
