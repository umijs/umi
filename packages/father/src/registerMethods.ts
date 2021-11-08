import { IApi } from './types';

export default (api: IApi) => {
  ['onFoo'].forEach((name) => {
    api.registerMethod({ name });
  });
};
