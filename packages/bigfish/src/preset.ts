import { IApi } from 'umi';

export default (api: IApi) => {
  api;
  return {
    plugins: [
      require.resolve('@umijs/plugins/dist/antd'),
      require.resolve('@umijs/plugins/dist/dva'),
      require.resolve('@umijs/plugins/dist/model'),
      require.resolve('@umijs/plugins/dist/analytics'),
      require.resolve('@umijs/plugins/dist/moment2dayjs'),
    ],
  };
};
