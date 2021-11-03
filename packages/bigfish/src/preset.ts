import { IApi } from 'umi';

export default (api: IApi) => {
  api.onStart(() => {
    console.log('hello bigfish');
  });
};
