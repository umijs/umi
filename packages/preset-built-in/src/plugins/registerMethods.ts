import { IApi } from '@umijs/types';
import assert from 'assert';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export default function(api: IApi) {
  [
    'onGenerateFiles',
    'addUmiExports',
    'modifyBundler',
    'modifyBundleConfig',
    'modifyBundleConfigs',
  ].forEach(name => {
    api.registerMethod({ name });
  });

  api.registerMethod({
    name: 'writeTmpFile',
    fn({ path, content }: { path: string; content: string }) {
      assert(
        api.service.stage >= api.ServiceStage.pluginReady,
        `api.writeTmpFile() should not execute in register stage.`,
      );
      const absPath = join(api.service.paths.absTmpPath!, path);
      api.utils.mkdirp.sync(dirname(absPath));
      if (!existsSync(absPath) || readFileSync(absPath, 'utf-8') !== content) {
        writeFileSync(absPath, content, 'utf-8');
      }
    },
  });
}
