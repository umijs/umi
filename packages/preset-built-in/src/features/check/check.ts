import assert from 'assert';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onCheck(() => {
    // routes
    assert(
      api.appData.routes,
      `routes not found, you may be run umi on the wrong directory.`,
    );
  });
};
