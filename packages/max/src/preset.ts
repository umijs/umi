import { IApi } from 'umi';

export default (api: IApi) => {
  api;
  return {
    plugins: [
      require.resolve('@umijs/plugins/dist/access'),
      require.resolve('@umijs/plugins/dist/analytics'),
      require.resolve('@umijs/plugins/dist/antd'),
      require.resolve('@umijs/plugins/dist/dva'),
      require.resolve('@umijs/plugins/dist/initial-state'),
      require.resolve('@umijs/plugins/dist/layout'),
      require.resolve('@umijs/plugins/dist/model'),
      require.resolve('@umijs/plugins/dist/moment2dayjs'),
      require.resolve('@umijs/plugins/dist/request'),
      require.resolve('@umijs/plugins/dist/locale'),
      require.resolve('@umijs/plugins/dist/qiankun'),
      require.resolve('./plugins/alias'),
    ],
  };
};
