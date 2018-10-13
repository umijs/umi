import assert from 'assert';

export default function(api) {
  api._registerConfig(() => {
    return api => {
      return {
        name: 'base',
        validate(val) {
          assert(
            typeof val === 'string',
            `base should be String, but got ${val}`,
          );
        },
        onChange() {
          api.service.restart(/* why */ 'Config base Changed');
        },
      };
    };
  });
}
