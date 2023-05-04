import { IApi } from 'umi';

const pkg = require('../../package.json');

export default (api: IApi) => {
  api.describe({
    key: 'appData:imu',
  });

  api.modifyAppData((memo) => {
    memo.umi.name = 'Imu';
    memo.umi.importSource = pkg.name;
    memo.umi.cliName = 'imu';
    return memo;
  });
};
