import { rollup, watch } from 'rollup';
import signale from 'signale';
import getRollupConfig from "./getRollupConfig";

interface IRollupOpts {
  cwd: string;
  entry: string | string[];
  type: 'esm' | 'cjs' | 'umd';
  target?: 'browser' | 'node',
  watch?: boolean,
}

interface IRollupBuildOpts extends IRollupOpts {
  entry: string;
}

async function build(opts: IRollupBuildOpts) {
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
      const bundle = await rollup(input); // eslint-disable-line
      await bundle.write(output); // eslint-disable-line
    }
  }
}

export default async function (opts: IRollupOpts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries, ...moreOpts } = opts;
    for (const entry of entries) {
      await build({ // eslint-disable-line
        ...moreOpts,
        entry,
      });
    }
  } else {
    await build(opts as IRollupBuildOpts);
  }
}
