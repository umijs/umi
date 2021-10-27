import { IApi } from '../../packages/preset-built-in/src/types';

export default (api: IApi) => {
  api.onDevCompileDone(({ isFirstCompile }) => {
    isFirstCompile;
    // console.log('> onDevCompileDone', isFirstCompile);
  });
};
