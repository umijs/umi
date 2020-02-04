import { join } from 'path';
import { readdirSync } from 'fs';
import { IApi } from 'umi-types';
import Block from './core/Block';
import { Resource } from '../../data';
import { DEFAULT_RESOURCES } from './util';

export default (api: IApi) => {
  // 区块资源可扩展
  let resources: Resource[] = [];

  api.onUISocket(async ({ action, failure, success, send }) => {
    if (!resources.length) {
      resources = api.applyPlugins('addBlockUIResource', {
        initialValue: DEFAULT_RESOURCES,
      });
      resources = api.applyPlugins('modifyBlockUIResources', {
        initialValue: resources,
      });
    }

    const blockService = new Block(api);
    blockService.init(send);
    const { type, payload = {}, lang } = action;

    const dir = join(__dirname, 'socketHandlers');
    const files = readdirSync(dir)
      .filter(f => f.charAt(0) !== '.')
      .map(f => f.replace(/\.(js|ts)$/, ''));

    if (files.includes(type)) {
      try {
        const fn = require(join(dir, type)).default;
        await fn({
          api,
          success,
          failure,
          send,
          payload,
          lang,
          blockService,
          resources,
        });
      } catch (e) {
        console.error(e);
        failure({
          message: e.message,
          success: false,
        });
      }
    }
  });
};
