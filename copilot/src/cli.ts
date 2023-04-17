import { chalk, clackPrompts, logger, resolve, yParser } from '@umijs/utils';
import { sendMessage } from './chatgpt';
import { printHelp } from './printHelp';
import prompts from './prompts';
const { confirm, spinner } = clackPrompts;

export async function main() {
  logger.info("🚧  It's in beta, please use it carefully.");
  const args = yParser(process.argv.slice(2), {
    alias: {
      help: ['h'],
    },
  });
  const cwd = args.cwd || process.cwd();

  if (args.help) {
    printHelp();
    return;
  }

  // --token
  const token = process.env.OPENAI_API_KEY || args.token;
  if (!token) {
    throw new Error('Please set OPENAI_API_KEY or --token');
  }

  const message = args._.join(' ');
  const s = spinner();
  s.start('🕖  Hold on, asking OpenAI...');

  const commonParams = {
    token,
    proxyUrl: args.proxyUrl,
  };

  const commandRes = await sendMessage({
    messages: [
      {
        role: 'system',
        content: prompts.commands,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    ...commonParams,
  });
  const willUseCommand: string = commandRes.data.choices[0].message.content;

  if (!prompts[willUseCommand]) {
    logger.warn(willUseCommand);
    throw new Error('No matching command');
  }

  const questionRes = await sendMessage({
    messages: [
      {
        role: 'system',
        content: `${prompts[willUseCommand]}.无法根据要求返回命令时,给出提示`,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    ...commonParams,
  });
  s.stop();
  const command = questionRes.data.choices[0].message.content;

  if (!/^[\w\s=\-'"{}:.]+$/.test(command)) {
    logger.warn(command);
    return;
  }

  logger.info('The suggested command is:');
  logger.info(chalk.green(command));

  const shouldRunCommand = await confirm({
    message: `Run the command?`,
  });
  // why equals true?
  // since if user press ctrl+c, shouldRunCommand will not be falsy
  if (shouldRunCommand === true) {
    logger.info('✅ Running the command...');
    process.env.FORCE_COLOR = '1';
    const commandPath = await findUmiCommand({ cwd });
    logger.info(`Command Path: ${commandPath}`);
    // why split?
    // since zx.$ has problem when parsing command with template string
    const { $ } = await import('zx');
    await $`${command.replace('umi', commandPath).split(' ')}`;
  }
}

async function findUmiCommand(opts: { cwd: string }) {
  let ret;
  // max > umi > global max > global umi
  if (!ret) ret = resolveSyncSilently('max/bin/max.js', opts.cwd);
  if (!ret) ret = resolveSyncSilently('umi/bin/umi.js', opts.cwd);
  const { $ } = await import('zx');
  try {
    if (!ret) ret = (await $`which max`).stdout.trim();
  } catch (_e) {}
  try {
    if (!ret) ret = (await $`which umi`).stdout.trim();
  } catch (_e) {}
  return ret;
}

function resolveSyncSilently(path: string, cwd: string) {
  try {
    return resolve.sync(path, {
      basedir: cwd,
    });
  } catch (e) {
    return null;
  }
}
