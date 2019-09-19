import signale from 'signale';
import { isPlainObject } from 'lodash';
import assert from 'assert';
import { createMiddleware } from 'umi-mock';

export default function(api) {
  const errors = [];

  api._registerConfig(() => {
    return api => {
      return {
        name: 'mock',
        validate(val) {
          assert(isPlainObject(val), `Configure item mock should be Plain Object, but got ${val}.`);
        },
        onChange() {
          api.service.restart(/* why */ 'Config mock Changed');
        },
        configs: [
          {
            group: 'basic',
            name: 'mock.exclude',
            type: 'string[]',
            title: {
              'zh-CN': 'Mock 忽略文件',
              'en-US': 'Ignored Mock Files',
            },
            description: {
              'zh-CN': '指定需要忽略的文件列表，支持 glob 格式。',
              'en-US': 'Support glob pattern.',
            },
          },
        ],
      };
    };
  });

  api._beforeServerWithApp(({ app }) => {
    if (process.env.MOCK !== 'none' && process.env.HTTP_MOCK !== 'none') {
      const beforeMiddlewares = api.applyPlugins('addMiddlewareBeforeMock', {
        initialValue: [],
      });
      const afterMiddlewares = api.applyPlugins('addMiddlewareAfterMock', {
        initialValue: [],
      });

      beforeMiddlewares.forEach(m => app.use(m));
      const {
        cwd,
        config,
        paths: { absPagesPath, absSrcPath },
      } = api;
      app.use(
        createMiddleware({
          cwd,
          config,
          errors,
          absPagesPath,
          absSrcPath,
          watch: !process.env.WATCH_FILES,
          onStart({ paths }) {
            api.addBabelRegister(paths);
          },
        }).middleware,
      );
      afterMiddlewares.forEach(m => app.use(m));
    }
  });

  api.onDevCompileDone(() => {
    if (errors.length) {
      signale.error(`Mock file parse failed`);
      errors.forEach(e => {
        console.error(e.message);
      });
    }
  });
}
