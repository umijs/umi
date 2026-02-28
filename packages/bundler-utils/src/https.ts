import { chalk, execa, logger } from '@umijs/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { RequestListener } from 'http';
import https from 'https';
import { join } from 'path';
import { HttpsServerOptions } from './types';

import type { createServer as CreateServer } from 'spdy';

const defaultHttpsHosts: HttpsServerOptions['hosts'] = [
  'localhost',
  '127.0.0.1',
];

export type { Server as SpdyServer } from 'spdy';

// vite mode requires a key cert
export async function resolveHttpsConfig(httpsConfig: HttpsServerOptions) {
  let { key, cert, hosts } = httpsConfig;

  // if the key and cert are provided return directly
  if (key && cert) {
    return {
      key,
      cert,
    };
  }

  // Check if mkcert is installed
  try {
    // use mkcert -help instead of mkcert --version for checking if mkcert is installed, cause mkcert --version does not exists in Linux
    await execa.execa('mkcert', ['-help']);
  } catch (e) {
    logger.error('[HTTPS] The mkcert has not been installed.');
    logger.info('[HTTPS] Please follow the guide to install manually.');
    switch (process.platform) {
      case 'darwin':
        console.log(chalk.green('$ brew install mkcert'));
        console.log(chalk.gray('# If you use firefox, please install nss.'));
        console.log(chalk.green('$ brew install nss'));
        console.log(chalk.green('$ mkcert -install'));
        break;
      case 'win32':
        console.log(
          chalk.green('Checkout https://github.com/FiloSottile/mkcert#windows'),
        );
        break;
      case 'linux':
        console.log(
          chalk.green('Checkout https://github.com/FiloSottile/mkcert#linux'),
        );
        break;
      default:
        break;
    }
    throw new Error(`[HTTPS] mkcert not found.`, { cause: e });
  }

  hosts = hosts || defaultHttpsHosts;
  key = join(__dirname, 'umi.https.key.pem');
  cert = join(__dirname, 'umi.https.pem');
  const json = join(__dirname, 'umi.https.json');

  // Generate cert and key files if they are not exist.
  if (
    !existsSync(key) ||
    !existsSync(cert) ||
    !existsSync(json) ||
    !hasHostsChanged(json, hosts!)
  ) {
    logger.wait('[HTTPS] Generating cert and key files...');
    await execa.execa('mkcert', [
      '-cert-file',
      cert,
      '-key-file',
      key,
      ...hosts!,
    ]);
    writeFileSync(json, JSON.stringify({ hosts }), 'utf-8');
  }

  return {
    key,
    cert,
  };
}

function hasHostsChanged(jsonFile: string, hosts: string[]) {
  try {
    const json = JSON.parse(readFileSync(jsonFile, 'utf-8'));
    return json.hosts.join(',') === hosts.join(',');
  } catch (e) {
    return true;
  }
}

export async function createHttpsServer(
  app: RequestListener,
  httpsConfig: HttpsServerOptions,
) {
  logger.wait('[HTTPS] Starting service in https mode...');

  const { key, cert } = await resolveHttpsConfig(httpsConfig);

  // Create server
  let createServer: typeof CreateServer;
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (httpsConfig.http2 === false || nodeMajor >= 24) {
    createServer = https.createServer;
  } else {
    try {
      createServer = (await import('spdy')).default.createServer;
    } catch (e) {
      logger.error(
        '[HTTPS] Error accrued when loading module spdy, maybe you should check your Node.js version, it requires Node.js < v24. See: https://github.com/spdy-http2/node-spdy/issues/397',
      );
      throw e;
    }
  }

  return createServer(
    {
      key: readFileSync(key, 'utf-8'),
      cert: readFileSync(cert, 'utf-8'),
    },
    app,
  );
}
