import { rollup, watch } from 'rollup';
import signale from 'signale';
import getRollupConfig from "./getRollupConfig";

interface IRollupOpts {
  cwd: string;
  entry: string;
  type: 'esm' | 'cjs' | 'umd';
  target?: 'browser' | 'node',
  watch?: boolean,
}

export default async function (opts: IRollupOpts) {
  const { cwd, entry, type, target = 'browser' } = opts;
  const rollupConfigs = getRollupConfig({
    cwd,
    type,
    entry,
    target,
  });

  for (const rollupConfig of rollupConfigs) {
    if (opts.watch) {
      const watcher = watch([
        {
          ...rollupConfig,
          watch: {},
        },
      ]);
      watcher.on('event', event => {
        if (event.error) {
          signale.error(event.error);
        } else {
          signale.info(`[${type}] file changed`);
        }
      });
    } else {
      const { output, ...input } = rollupConfig;
      const bundle = await rollup(input);
      await bundle.write(output);
    }
  }
}
