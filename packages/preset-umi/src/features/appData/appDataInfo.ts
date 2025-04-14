import type { IApi } from '../../types';

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    api.logger.info('onGenerateFiles');
    api.writeTmpFile({
      path: 'appData.json',
      content: JSON.stringify('{}', null, 2),
      noPluginDir: true,
    });
  });
};
