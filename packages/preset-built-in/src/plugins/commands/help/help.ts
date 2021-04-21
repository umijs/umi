import { ICommand } from '@umijs/core/lib/Service/types';
import { IApi } from '@umijs/types';
import { chalk, lodash } from '@umijs/utils';
import assert from 'assert';

function getDescriptions(commands: any) {
  return Object.keys(commands)
    .filter((name) => typeof commands[name] !== 'string')
    .map((name) => {
      return getDescription(commands[name]);
    });
}

function getDescription(command: any) {
  return `    ${chalk.green(lodash.padEnd(command.name, 10))}${
    command.description || ''
  }`;
}

function padLeft(str: string) {
  return str
    .split('\n')
    .map((line: string) => `    ${line}`)
    .join('\n');
}

export default (api: IApi) => {
  api.registerCommand({
    name: 'help',
    description: 'show command helps',
    fn({ args }) {
      const commandName = args._[0];
      if (commandName) {
        const command = api.service.commands[commandName] as ICommand;
        assert(command, `Command ${commandName} not found.`);
        console.log(`
  Usage: umi ${commandName} [options]

  Options:

  Details:

${command.details ? padLeft(command.details.trim()) : ''}
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
