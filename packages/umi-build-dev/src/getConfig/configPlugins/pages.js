import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { join } from 'path';
import { existsSync } from 'fs';

export default function() {
  function getFiles(cwd, pages) {
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
          this.relativeFile
        }" 的 "pages" 配置必须是 "Object 对象"，但你配置的是 ${pages.toString()} 。`,
      );
      Object.keys(pages).forEach(key => {
        const { document } = pages[key];
        if (document) {
          assert(
            existsSync(join(this.cwd, document)),
            `"${this.relativeFile}" 文件中 "${key}" 的模板文件 "${
              document
            }" 并不存在。`,
          );
        }
      });
    },
    watch(pages) {
      this.unwatch();
      const files = getFiles(this.cwd, pages);
      this.watch(files).on('all', type => {
        if (type === 'add') return;
        this.reload();
      });
    },
    onChange(newPages) {
      this.reload();
      this.plugin.watch.call(this, newPages);
    },
  };
}
