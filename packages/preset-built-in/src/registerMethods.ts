import { IApi } from '@umijs/types';

export default function(api: IApi) {
  ['onGenerateFiles'].forEach(name => {
    api.registerMethod({ name });
  });
}
