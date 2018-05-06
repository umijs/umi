import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { cwd } = api.service.paths;

  function getFiles(pages) {
    const files = [
      join(__dirname, '../../../template/document.ejs'),
      join(cwd, 'src/page/document.ejs'),
      join(cwd, 'src/pages/document.ejs'),
      join(cwd, 'pages/document.ejs'),
    ];
    if (pages) {
      Object.keys(pages).forEach(key => {
        const { document } = pages[key];
        if (document) {
          files.push(join(cwd, document));
        }
      });
    }
    return files;
  }

  return {
    name: 'pages',
    validate(pages) {
      assert(
        isPlainObject(pages),
        `"${
          api.relativeFile
        }" 的 "pages" 配置必须是 "Object 对象"，但你配置的是 ${pages.toString()} 。`,
      );
      Object.keys(pages).forEach(key => {
        const { document } = pages[key];
        if (document) {
          assert(
            existsSync(join(cwd, document)),
            `"${
              api.relativeFile
            }" 文件中 "${key}" 的模板文件 "${document}" 并不存在。`,
          );
        }
      });
    },
    watch(pages) {
      if (!pages) {
        pages = api.config[this.name];
      }
      api.unwatch('pages');
      const files = getFiles(pages);
      const watcher = api.watch('pages', files);
      if (watcher) {
        watcher.on('all', type => {
          if (type === 'add') return;
          api.service.reload();
        });
      }
    },
    onChange(newConfig) {
      api.service.config = newConfig;
      api.service.filesGenerator.rebuild();
      // api.service.reload();
      this.watch(newConfig[this.name]);
    },
  };
}
