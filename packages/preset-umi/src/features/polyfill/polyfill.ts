import { IApi } from '../../types';

export default (api: IApi) => {
  api.addPolyfillImports(() => {
    const polyfillImports: { source: string; specifier?: string }[] = [];
    if (!!api.config.targets?.ie) {
      polyfillImports.push({
        source: require.resolve('current-script-polyfill'),
      });
    }
    return polyfillImports;
  });
};
