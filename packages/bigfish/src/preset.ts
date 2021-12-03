import { IApi } from 'umi';

export default (api: IApi) => {
  api;
  return {
    plugins: [
      require.resolve('@umijs/plugins/dist/antd'),
      require.resolve('@umijs/plugins/dist/dva'),
    ],
  };
};
