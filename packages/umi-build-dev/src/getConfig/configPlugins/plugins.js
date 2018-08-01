import assert from 'assert';
import { diffPlugins } from '../../getPlugins';

export default function(api) {
  return {
    name: 'plugins',
    validate(val) {
      assert(
        Array.isArray(val),
        `Configure item plugins should be Array, but got ${val}.`,
      );
    },
    onChange(newConfig, oldConfig) {
      const result = diffPlugins(newConfig[this.name], oldConfig[this.name], {
        cwd: api.service.cwd,
      });
      if (result.pluginsChanged) {
        api.service.restart('Config plugins Changed');
      } else {
        result.optionChanged.forEach(({ id, opts }) => {
          api.service.changePluginOption(id, opts);
        });
      }
    },
  };
}
