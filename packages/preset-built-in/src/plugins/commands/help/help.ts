import { IApi } from '@umijs/types';
import { chalk, lodash } from '@umijs/utils';

function getDescriptions(commands: any) {
  return Object.keys(commands)
    .filter(name => typeof commands[name] !== 'string')
    .map(name => {
      return getDescription(commands[name]);
    });
}

function getDescription(command: any) {
  return `    ${chalk.green(
    lodash.padEnd(command.name, 10),
  )}${command.description || ''}`;
}

export default (api: IApi) => {
  api.registerCommand({
    name: 'help',
    description: 'show command helps',
    fn({ args }) {
      const command = args._[0];
      if (command) {
        console.log(`
  Usage: umi ${command} [options]

  Options:

  Details:
        `);
      } else {
        console.log(`
  Usage: umi <command> [options]

  Commands:

${getDescriptions(api.service.commands).join('\n')}

  Run \`${chalk.bold(
    'umi help <command>',
  )}\` for more information of specific commands.
  Visit ${chalk.bold('https://umijs.org/')} to learn more about Umi.
      `);
      }
    },
  });
};
