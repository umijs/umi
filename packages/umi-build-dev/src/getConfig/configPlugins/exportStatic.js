import assert from 'assert';

export default function() {
  return {
    name: 'exportStatic',
    validate(val) {
      assert(
        typeof val === 'boolean',
        `"${
          this.relativeFile
        }" 的 "exportStatic" 配置必须是 "布尔值"，但你配置的是 ${val.toString()} 。`,
      );
    },
  };
}
