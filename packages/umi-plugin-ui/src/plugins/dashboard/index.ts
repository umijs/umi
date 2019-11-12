import request from 'umi-request';
import * as path from 'path';
import * as fs from 'fs';
import p from 'immer';
import mkdirp from 'mkdirp';
import assert from 'assert';
import { IApi } from 'umi-types';

export default (api: IApi) => {
  const getDataPath = dbPath => {
    return path.join(dbPath, 'dashboard.json');
  };

  const writeData = (dbPath, data = {}) => {
    const dbDataPath = getDataPath(dbPath);
    fs.writeFileSync(dbDataPath, JSON.stringify(data, null, 2), 'utf-8');
  };

  const getData = async dbPath => {
    assert(dbPath, `dbPath must be supplied, received: ${dbPath}.`);

    if (!fs.existsSync(dbPath)) {
      mkdirp.sync(dbPath);
    }
    const dbData = getDataPath(dbPath);
    if (!fs.existsSync(dbData)) {
      writeData(dbPath);
    }
    // remove cache
    delete require.cache[dbData];
    // eslint-disable-next-line import/no-dynamic-require
    const list = require(dbData);
    if (!api._.isPlainObject(list)) {
      // reset data into right structure
      writeData(dbPath);
      return {};
      // throw new Error(`dbData error ${JSON.stringify(list)}`);
    }
    return list;
  };

  api.onUISocket(async ({ action, failure, success, send }) => {
    const { type, payload = {}, lang } = action;
    switch (type) {
      case 'org.umi.dashboard.card.list': {
        try {
          const { dbPath } = payload;
          const list = await getData(dbPath);
          success(list);
        } catch (e) {
          failure(e);
        }

        break;
      }
      case 'org.umi.dashboard.card.list.change': {
        try {
          const { dbPath, key, enable } = payload;
          console.log('change payload', payload);
          const list = await getData(dbPath);
          const newList = p(list, draft => {
            draft[key] = {
              ...(draft[key] || {}),
              enable: !!enable,
            };
          });

          writeData(dbPath, newList);
          success(newList);
        } catch (e) {
          failure(e);
        }

        break;
      }
      case 'org.umi.dashboard.zaobao.list': {
        const result = await request('https://ui.umijs.org/api/zaobao');
        success(result);
        break;
      }
      case 'org.umi.dashboard.zaobao.list.detail': {
        const { id } = payload;
        const result = await request(`https://ui.umijs.org/api/zaobao/${id}`);
        success(result);
        break;
      }
      default:
        break;
    }
  });
  api.addUIPlugin(require.resolve('../../../src/plugins/dashboard/dist/ui.umd'));
};
