import { IApi } from '@umijs/types';

export default function(api: IApi) {
  ['onPluginReady', 'onStart', 'onGenerateFiles', 'modifyPaths'].forEach(
    name => {
      api.registerMethod({ name });
    },
  );
}
