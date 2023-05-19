import { RuntimeAntdConfig } from 'umi';

export const antd: RuntimeAntdConfig = (memo) => {
  memo.appConfig ??= {};
  memo.appConfig.message ??= {};
  memo.appConfig.message.duration = 5;
  // .umirc.ts 中配置了 dark = false
  memo.dark = true;
  return memo;
};
