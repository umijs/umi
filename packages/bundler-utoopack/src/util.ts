import { chalk } from '@umijs/utils';

type IDevBannerOpts = {
  duration?: number;
  host?: string;
  ip?: string;
  packVersion?: string;
  port?: number;
  protocol: string;
};

type IBuildBannerOpts = {
  assetCount?: number;
  duration?: number;
  outputPath?: string;
  packVersion?: string;
};

export function getPackVersion(packVersion?: string) {
  if (packVersion) {
    return packVersion;
  }

  try {
    const pkg = require('../package.json');
    return pkg.dependencies?.['@utoo/pack']?.replace(/^[^\d]*/, '');
  } catch {
    return undefined;
  }
}

function formatDuration(duration?: number) {
  if (typeof duration !== 'number') {
    return undefined;
  }

  return `${Math.max(0, Math.round(duration))}ms`;
}

export function getDevBanner({
  protocol,
  host,
  port,
  ip,
  packVersion,
  duration,
}: IDevBannerOpts) {
  const hostStr = !host || host === '0.0.0.0' ? 'localhost' : host;
  const resolvedPackVersion = getPackVersion(packVersion);
  const readyTime = formatDuration(duration);
  const header = [
    chalk.cyan.bold('utoo pack'),
    resolvedPackVersion ? chalk.blueBright(`v${resolvedPackVersion}`) : null,
    chalk.green('ready'),
    readyTime ? chalk.dim(`in ${readyTime}`) : null,
  ]
    .filter(Boolean)
    .join(' ');

  const messages = [
    '',
    `  ${header}`,
    '',
    `  ${chalk.green('➜')}  Local:   ${chalk.cyan(
      `${protocol}//${hostStr}:${port}`,
    )}`,
  ];

  if (ip && ip !== '0.0.0.0' && ip !== hostStr) {
    messages.push(
      `  ${chalk.green('➜')}  Network: ${chalk.cyan(
        `${protocol}//${ip}:${port}`,
      )}`,
    );
  }

  return messages.join('\n');
}

export function getBuildBanner({
  packVersion,
  duration,
  outputPath,
  assetCount,
}: IBuildBannerOpts) {
  const resolvedPackVersion = getPackVersion(packVersion);
  const builtTime = formatDuration(duration);
  const messages = [
    '',
    `  ${[
      chalk.cyan.bold('utoo pack'),
      resolvedPackVersion ? chalk.blueBright(`v${resolvedPackVersion}`) : null,
      chalk.green('built'),
      builtTime ? chalk.dim(`in ${builtTime}`) : null,
    ]
      .filter(Boolean)
      .join(' ')}`,
  ];

  if (outputPath || typeof assetCount === 'number') {
    messages.push('');
  }

  if (outputPath) {
    messages.push(`  ${chalk.green('➜')}  Output:  ${chalk.cyan(outputPath)}`);
  }

  if (typeof assetCount === 'number') {
    messages.push(
      `  ${chalk.green('➜')}  Assets:  ${chalk.cyan(
        `${assetCount} file${assetCount === 1 ? '' : 's'}`,
      )}`,
    );
  }

  return messages.join('\n');
}
