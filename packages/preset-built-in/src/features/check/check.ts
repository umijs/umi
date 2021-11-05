import assert from 'assert';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onCheck(async () => {
    // routes
    assert(
      api.appData.routes,
      `routes not found, you may be run umi on the wrong directory.`,
    );

    await api.applyPlugins({
      key: 'onChangePkgJSON',
      args: {
        current: api.appData.pkg,
      },
    });
    await api.applyPlugins({
      key: 'onCheckConfig',
      args: {
        config: api.config,
      },
    });
  });
};
