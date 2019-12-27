import { IApi } from '@umijs/types';

export default function(api: IApi) {
  ['onGenerateFiles', 'addUmiExports'].forEach(name => {
    api.registerMethod({ name });
  });
}
