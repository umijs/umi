import { chalk, logger } from '@umijs/utils';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import http, { RequestListener } from 'http';
import https from 'https';
import { join } from 'path';
import { HttpsParams } from '../types';

const defaultHttpsHosts: HttpsParams['hosts'] = ['localhost', '127.0.0.1'];

/**
 * Check if mkcert is installed
 */
const mkcertCmdChecker = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('mkcert -help', (error, stdout) => {
      if (!error && stdout?.includes?.('mkcert')) {
        resolve(true);
      } else {
        reject(false);
      }
    });
  });
};

/**
 * Generate key and certificate files in https mode.
 */
const generateCertFiles = async (
  hosts = defaultHttpsHosts,
): Promise<Omit<HttpsParams, 'hosts'>> => {
  return new Promise((resolve, reject) => {
    logger.warn('[https] No key or cert has been passed in.');

    mkcertCmdChecker()
      .then(() => {
        logger.wait('[https] Generating cert and key files...');

        const certFilePath = join(__dirname, 'umi.pem');
        const keyFilePath = join(__dirname, 'umi.key.pem');

        exec(
          `mkcert -cert-file ${certFilePath} -key-file ${keyFilePath} ${hosts.join(
            ' ',
          )}`,
          (error) => {
            if (error) {
              reject({});
            } else {
              resolve({
                key: keyFilePath,
                cert: certFilePath,
              });
            }
          },
        );
      })
      .catch(() => {
        reject(new Error('[https] The mkcert has not been installed.'));
        logger.info(
          [
            '[https] Please follow the guide to install manually.\n',
            `\tMac: ${chalk.green(
              [
                'brew install mkcert',
                'brew install nss',
                'mkcert -install',
              ].join(' + '),
            )}\n`,
            `\tWindows: ${chalk.green(
              'https://github.com/FiloSottile/mkcert#windows',
            )}\n`,
            `\tLinux: ${chalk.green(
              'https://github.com/FiloSottile/mkcert#linux',
            )}\n`,
          ].join(''),
        );
      });
  });
};

export const getServer = async (
  app: RequestListener,
  httpsConfig?: HttpsParams,
) => {
  if (!httpsConfig) {
    return http.createServer(app);
  }

  logger.wait('[https] Starting service in https mode...');

  const isHttpsConfigLegally = httpsConfig.cert && httpsConfig.key;
  const { key, cert } = isHttpsConfigLegally
    ? httpsConfig
    : await generateCertFiles(httpsConfig.hosts);

  if (key && cert) {
    return https.createServer(
      {
        key: readFileSync(key, 'utf8'),
        cert: readFileSync(cert, 'utf8'),
      },
      app,
    );
  }
};
