import { IApi } from 'umi';

function isSlaveEnable() {
  return false;
}

export default (api: IApi) => {
  api.describe({
    key: 'qiankun-slave',
    enableBy: isSlaveEnable,
  });
};
