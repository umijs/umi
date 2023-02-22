import { IApi } from '../../types';

const ENTRY_PATH = '/__umi_ui/entry';

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev' && api.args.ui;
    },
  });

  api.onBeforeMiddleware(({ app }) => {
    app.use(ENTRY_PATH, async (req: any, _res) => {
      req;
    });
  });
};
