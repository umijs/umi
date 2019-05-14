import assert from 'assert';
import { diffPlugins } from '../../getPlugins';

const debug = require('debug')('umi-build-dev:configPlugin:plugins');

export default function(api) {
  return {
    name: 'plugins',
    validate(val) {
      assert(Array.isArray(val), `Configure item plugins should be Array, but got ${val}.`);
    },
    onChange(newConfig, oldConfig) {
      debug(`plugins changed from ${oldConfig[this.name]} to ${newConfig[this.name]}`);
      const result = diffPlugins(newConfig[this.name], oldConfig[this.name], {
        cwd: api.service.cwd,
      });
      if (result.pluginsChanged) {
        api.service.restart('Config plugins Changed');
      } else {
        debug(`result.optionChanged: ${result.optionChanged}`);
        result.optionChanged.forEach(({ id, opts }) => {
          api.service.changePluginOption(id, opts);
        });
      }
    },
  };
}
