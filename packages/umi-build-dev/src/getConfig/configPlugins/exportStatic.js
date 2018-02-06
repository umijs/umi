import assert from 'assert';
import isPlainObject from 'is-plain-object';

export default function(api) {
  return {
    name: 'exportStatic',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `"${
          api.relativeFile
        }" 的 "exportStatic" 配置必须是 "对象" 或者 "布尔值"，但你配置的是 ${val.toString()} 。`,
      );
    },
  };
}
