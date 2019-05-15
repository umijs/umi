import { join } from 'path';
import getPaths from 'umi-core/lib/getPaths';

function template(path) {
  return join(__dirname, '../template', path);
}

export default function(service) {
  const { cwd, config } = service;
  return {
    ...getPaths({ cwd, config }),
    defaultEntryTplPath: template('entry.js.tpl'),
    defaultRouterTplPath: template('router.js.tpl'),
    defaultHistoryTplPath: template('history.js.tpl'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    defaultDocumentPath: template('document.ejs'),
    defaultBlockEntryTplPath: template('blockEntry.js.tpl'),
  };
}
