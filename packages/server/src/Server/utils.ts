import { Logger } from '@umijs/core';
import immer from '@umijs/deps/compiled/immer';
import * as fs from 'fs';
import { join } from 'path';
import { IHttps, IServerOpts } from './Server';

const logger = new Logger('@umijs/server:utils');

export const getCredentials = (opts: IServerOpts): IHttps => {
  const { https } = opts;
  const defautlServerOptions: IHttps = {
    key: join(__dirname, 'cert', 'key.pem'),
    cert: join(__dirname, 'cert', 'cert.pem'),
  };
  // custom cert using https: { key: '', cert: '' }
  const serverOptions = (https === true
    ? defautlServerOptions
    : https) as IHttps;
  if (!serverOptions?.key || !serverOptions?.cert) {
    const err = new Error(
      `Both options.https.key and options.https.cert are required.`,
    );
    logger.error(err);
    throw err;
  }
  const credentials = immer(
    {
      ...serverOptions,
      key: fs.readFileSync(serverOptions?.key as string, 'utf-8'),
      cert: fs.readFileSync(serverOptions?.cert as string, 'utf-8'),
    },
    (draft: any) => {
      if (typeof serverOptions === 'object' && serverOptions.ca) {
        const newServerOptions = immer(serverOptions, (optDraft: any) => {
          // @ts-ignore
          optDraft.ca = !Array.isArray(optDraft.ca)
            ? [optDraft.ca]
            : optDraft.ca;
        });

        if (Array.isArray(newServerOptions.ca)) {
          // @ts-ignore
          draft.ca = newServerOptions.ca.map(function (ca) {
            return fs.readFileSync(ca, 'utf-8');
          });
        }
      }
    },
  );
  return credentials;
};
