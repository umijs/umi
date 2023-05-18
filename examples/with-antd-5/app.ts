import { theme } from 'antd';
import { RuntimeAntdConfig } from 'umi';
const { darkAlgorithm, compactAlgorithm } = theme;

export const antd: RuntimeAntdConfig = (memo) => {
  memo.appConfig ??= {};
  memo.appConfig.message ??= {};
  memo.appConfig.message.duration = 5;
  memo.theme ??= {};
  memo.theme.algorithm = [darkAlgorithm, compactAlgorithm];
  return memo;
};
