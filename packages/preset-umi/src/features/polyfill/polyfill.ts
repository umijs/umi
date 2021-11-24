import { IApi } from '../../types';

export default (api: IApi) => {
  api.addPolyfillImports(() => {
    return api.config.targets?.ie
      ? [
          {
            source: require.resolve('current-script-polyfill'),
          },
        ]
      : [];
  });
};
