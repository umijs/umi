import { IApi } from '@umijs/types';
import assert from 'assert';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export default function (api: IApi) {
  [
    'onGenerateFiles',
    'onBuildComplete',
    'onExit',
    'onPatchRoute',
    'onPatchRouteBefore',
    'onPatchRoutes',
    'onPatchRoutesBefore',
    'onDevCompileDone',
    'addBeforeMiddewares',
    'addDevScripts',
    'addMiddewares',
    'addRuntimePlugin',
    'addRuntimePluginKey',
    'addUmiExports',
    'addProjectFirstLibraries',
    'addPolyfillImports',
    'addEntryImportsAhead',
    'addEntryImports',
    'addEntryCodeAhead',
    'addEntryCode',
    'addHTMLMetas',
    'addHTMLLinks',
    'addHTMLStyles',
    'addHTMLHeadScripts',
    'addHTMLScripts',
    'addTmpGenerateWatcherPaths',
    'chainWebpack',
    'modifyHTML',
    'modifyBundler',
    'modifyBundleConfigOpts',
    'modifyBundleConfig',
    'modifyBundleConfigs',
    'modifyBabelOpts',
    'modifyBabelPresetOpts',
    'modifyBundleImplementor',
    'modifyHTMLChunks',
    'modifyPublicPathStr',
    'modifyRendererPath',
    'modifyRoutes',
  ].forEach((name) => {
    api.registerMethod({ name });
  });

  api.registerMethod({
    name: 'writeTmpFile',
    fn({ path, content }: { path: string; content: string }) {
      assert(
        api.stage >= api.ServiceStage.pluginReady,
        `api.writeTmpFile() should not execute in register stage.`,
      );
      const absPath = join(api.paths.absTmpPath!, path);
      api.utils.mkdirp.sync(dirname(absPath));
      if (!existsSync(absPath) || readFileSync(absPath, 'utf-8') !== content) {
        writeFileSync(absPath, content, 'utf-8');
      }
    },
  });
}
