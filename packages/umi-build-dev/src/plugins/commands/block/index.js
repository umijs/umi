import assert from 'assert';
import chalk from 'chalk';
import { isPlainObject } from 'lodash';
import clearGitCache from './clearGitCache';
import addBlock from './addBlock';
import listBlock from './list';

export default api => {
  // 注册 区块的 ui
  // 以下场景不启动 ui 功能:
  // 1. ssr 时
  // 2. 非 dev 或 ui 时
  const command = process.argv.slice(2)[0];
  if (process.env.UMI_UI !== 'none' && !api.config.ssr && (command === 'dev' || command === 'ui')) {
    require('./ui/index').default(api);
  }

  const { log, debug, config } = api;
  const blockConfig = config.block || {};

  debug(`blockConfig ${blockConfig}`);

  async function block(args = {}, opts = {}) {
    let retCtx;
    switch (args._[0]) {
      case 'clear':
        await clearGitCache({ dryRun: args.dryRun }, api);
        break;
      case 'add':
        retCtx = await addBlock({ ...args, url: args._[1] }, opts, api);
        break;
      case 'list':
        retCtx = await listBlock(args, blockConfig, api);
        break;
      default:
        throw new Error(
          `Please run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
        );
    }
    return retCtx; // return for test
  }

  const details = `

Commands:

  ${chalk.cyan(`add `)}     add a block to your project
  ${chalk.cyan(`list`)}     list all blocks
  ${chalk.cyan(`clear`)}    clear all git cache


Options for the ${chalk.cyan(`add`)} command:

  ${chalk.green(`--path              `)} the file path, default the name in package.json
  ${chalk.green(`--route-path       `)} the route path, default the name in package.json
  ${chalk.green(`--branch            `)} git branch
  ${chalk.green(`--npm-client        `)} the npm client, default npm or yarn (if has yarn.lock)
  ${chalk.green(`--skip-dependencies `)} don't install dependencies
  ${chalk.green(`--skip-modify-routes`)} don't modify the routes
  ${chalk.green(`--dry-run           `)} for test, don't install dependencies and download
  ${chalk.green(`--page              `)} add the block to a independent directory as a page
  ${chalk.green(`--layout            `)} add as a layout block (add route with empty children)
  ${chalk.green(`--js                `)} If the block is typescript, convert to js
  ${chalk.green(`--registry          `)} set up npm installation using the registry
  ${chalk.green(`--uni18n          `)}   remove umi-plugin-locale formatMessage

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
    (args, opts) => {
      // return only for test
      return block(args, opts).catch(e => {
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
