import { isLocalDev } from '@umijs/utils';
import fs from 'fs';
import path from 'path';
import { IApi, IUIModule } from '../../types';
// @ts-ignore
import sirv from '../../../compiled/sirv';

const ENTRY_PATH = '/__umi_ui/entry';

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev' && api.userConfig.ui;
    },
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
  });

  const uiDir = path.dirname(require.resolve('@umijs/ui/package.json'));

  api.onCheck(() => {
    if (!fs.existsSync(path.join(uiDir, 'dist'))) {
      if (isLocalDev()) {
        throw new Error(
          `@umijs/ui not built, please run 'pnpm ui:build' first.`,
        );
      } else {
        throw new Error(`@umijs/ui not found, please fill an issue on github.`);
      }
    }
  });

  api.onBeforeMiddleware(({ app }) => {
    app.use(
      ENTRY_PATH,
      sirv(path.join(uiDir, 'dist'), {
        etag: true,
        dev: true,
        single: true,
      }),
    );
  });

  api.addHTMLStyles(() => {
    return [
      `
#umi-ui-container.umi-ui-container-show {
  display: block;
}
#umi-ui-container {
  position: fixed;
  bottom: 10px;
  left: calc(10vw + 10px);
  height: calc(75vh - 20px);
  width: calc(80vw - 20px);
  display: none;
  border-radius: .5rem;
  z-index: 2147483646;
}
#umi-ui-toggle-btn {
  width: 40px;
  height: 40px;
  position: fixed;
  left: 50%;
  bottom: -20px;
  transform: translateX(-50%);
  cursor: pointer;
  display: flex;
  background-size: 100% 100%;
  background-image: url('data:image/png;base64,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');
  transition: bottom 0.1s linear;
  z-index: 2147483647;
}
#umi-ui-toggle-btn:hover {
  bottom: 0px;
}
#umi-ui-iframe {
  width: 100%;
  height: 100%;
  outline: none;
  border: 1px solid rgba(125,125,125,0.2);
  border-radius: 0.5rem;
}
      `,
    ];
  });

  api.modifyAppData(async (memo) => {
    const uiModules: IUIModule =
      (await api.applyPlugins({
        key: 'addUIModules',
        initialValue: [],
      })) ?? [];
    memo.ui = {
      modules: uiModules,
    };
    return memo;
  });

  api.onGenerateFiles(({ isFirstTime }) => {
    if (!isFirstTime) return;
    api.writeTmpFile({
      path: 'core/ui.ts',
      noPluginDir: true,
      content: `
// button and iframe
const container = document.createElement('div')
container.id = 'umi-ui-container';
const iframe = document.createElement('iframe');
iframe.id = 'umi-ui-iframe';
iframe.src = '${process.env.DEBUG_UMI_UI_PATH || ENTRY_PATH}';
const uiBtn = document.createElement('div');
uiBtn.id = 'umi-ui-toggle-btn';
container.appendChild(iframe);
document.body.appendChild(uiBtn);
document.body.appendChild(container);
uiBtn.addEventListener('click', () => {
  container.classList.toggle('umi-ui-container-show');
});
      `,
    });
  });
  api.addEntryImports(() => {
    return [{ source: '@@/core/ui' }];
  });
};
