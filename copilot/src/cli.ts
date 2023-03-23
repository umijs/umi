import { chalk, clackPrompts, logger, resolve, yParser } from '@umijs/utils';
import { sendMessage } from './chatgpt';
import { SYSTEM_PROMPT } from './constants';
import { printHelp } from './printHelp';
const { confirm, spinner } = clackPrompts;

async function main() {
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
  const res = await sendMessage({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    token,
    // --proxy-url
    proxyUrl: args.proxyUrl,
  });
  s.stop();
  const command = res.data.choices[0].message.content;
  logger.info('The suggested command is:');
  logger.info(chalk.green(command));

  const shouldRunCommand = await confirm({
    message: `Run the command?`,
  });
  console.log('shouldRunCommand', shouldRunCommand);
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

(async () => {
  await main();
})().catch((e) => {
  logger.error(e);
  process.exit(1);
});
