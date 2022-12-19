import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyConfig((memo) => {
    memo.define = {
      Foo: api.args.foo ? 'foo' : '',
    };
    return memo;
  });
};
