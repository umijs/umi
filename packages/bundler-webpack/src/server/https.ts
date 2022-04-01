import { chalk, execa, logger } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { RequestListener } from 'http';
import https from 'https';
import { join } from 'path';
import { HttpsParams } from '../types';

const defaultHttpsHosts: HttpsParams['hosts'] = ['localhost', '127.0.0.1'];

export async function createHttpsServer(
  app: RequestListener,
  httpsConfig: HttpsParams,
) {
  logger.wait('[HTTPS] Starting service in https mode...');

  // Check if mkcert is installed
  try {
    await execa.execa('mkcert', ['--version']);
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
    throw new Error(`[HTTPS] mkcert not found.`);
  }

  let { key, cert, hosts } = httpsConfig;
  hosts = hosts || defaultHttpsHosts;
  if (!key || !cert) {
    key = join(__dirname, 'umi.key.pem');
    cert = join(__dirname, 'umi.pem');
  }

  // Generate cert and key files if they are not exist.
  if (!existsSync(key) || !existsSync(cert)) {
    logger.wait('[HTTPS] Generating cert and key files...');
    await execa.execa('mkcert', [
      '-cert-file',
      cert,
      '-key-file',
      key,
      ...hosts!,
    ]);
  }

  // Create server
  return https.createServer(
    {
      key: readFileSync(key, 'utf-8'),
      cert: readFileSync(cert, 'utf-8'),
    },
    app,
  );
}
