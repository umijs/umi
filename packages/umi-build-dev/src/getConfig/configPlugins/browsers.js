import assert from 'assert';

export default function() {
  return {
    name: 'browsers',
    validate(val) {
      assert(
        Array.isArray(val),
        `"${
          this.relativeFile
        }" 的 "browsers" 配置必须是 "数组"，但你配置的是 ${val.toString()} 。`,
      );
    },
    onChange() {
      this.restart(/* why */ 'Config browsers Changed');
    },
  };
}
