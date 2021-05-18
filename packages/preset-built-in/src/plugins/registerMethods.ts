import { IApi } from '@umijs/types';
import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { EOL } from 'os';
import { dirname, join } from 'path';
import { isTSFile } from './utils';

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
    'addBeforeMiddlewares',
    'addBeforeMiddewares',
    'addDepInfo',
    'addDevScripts',
    'addMiddlewares',
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
    'modifyDevHTMLContent',
    'modifyExportRouteMap',
    'modifyProdHTMLContent',
    'modifyPublicPathStr',
    'modifyRendererPath',
    'modifyRoutes',
  ].forEach((name) => {
    api.registerMethod({ name });
  });

  api.registerMethod({
    name: 'writeTmpFile',
    fn({
      path,
      content,
      skipTSCheck = true,
    }: {
      path: string;
      content: string;
      skipTSCheck?: boolean;
    }) {
      assert(
        api.stage >= api.ServiceStage.pluginReady,
        `api.writeTmpFile() should not execute in register stage.`,
      );
      const absPath = join(api.paths.absTmpPath!, path);
      api.utils.mkdirp.sync(dirname(absPath));
      if (isTSFile(path) && skipTSCheck) {
        // write @ts-nocheck into first line
        content = `// @ts-nocheck${EOL}${content}`;
      }
      if (!existsSync(absPath) || readFileSync(absPath, 'utf-8') !== content) {
        writeFileSync(absPath, content, 'utf-8');
      }
    },
  });
}
