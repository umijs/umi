import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

export default function() {
  return {
    name: 'theme',
    validate(val) {
      assert(
        typeof val === 'string' || isPlainObject(val),
        `"${
          this.relativeFile
        }" 的 "theme" 配置必须是 "字符串" 或 "Object 对象"，但你配置的是 ${val.toString()} 。`,
      );

      const { cwd } = this;
      if (typeof val === 'string') {
        const themeFile = join(cwd, val);
        assert(
          existsSync(themeFile),
          `"${this.relativeFile}" 的 "theme" 配置文件 "${themeFile.replace(
            `${cwd}/`,
            '',
          )}" 不存在。`,
        );
      }
    },
    watch(val) {
      if (typeof val === 'string') {
        const { file } = this;
        const themeFile = join(dirname(file), val);
        this.watch(themeFile, this.onChange.bind(this));
      }
    },
    onChange() {
      this.restart(/* why */ 'Theme File Changed');
    },
  };
}
