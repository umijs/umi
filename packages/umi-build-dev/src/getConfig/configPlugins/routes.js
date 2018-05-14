import assert from 'assert';

export default function(api) {
  return {
    name: 'routes',
    validate(val) {
      assert(
        Array.isArray(val),
        `routes should be Array, but got ${val.toString()}.`,
      );
    },
    onChange(newConfig) {
      api.service.config = newConfig;
      api.service.filesGenerator.rebuild();
    },
  };
}
