import { ModuleFormat, rollup, watch } from 'rollup';
import signale from 'signale';
import getRollupConfig from './getRollupConfig';
import { IBundleOptions } from './types';
import normalizeBundleOpts from './normalizeBundleOpts';

interface IRollupOpts {
  cwd: string;
  entry: string | string[];
  type: ModuleFormat;
  bundleOpts: IBundleOptions;
  watch?: boolean;
}

async function build(entry: string, opts: IRollupOpts) {
  const { cwd, type, bundleOpts } = opts;
  const rollupConfigs = getRollupConfig({
    cwd,
    type,
    entry,
    bundleOpts: normalizeBundleOpts(entry, bundleOpts),
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

export default async function(opts: IRollupOpts) {
  if (Array.isArray(opts.entry)) {
    const { entry: entries } = opts;
    for (const entry of entries) {
      await build(entry, opts);
    }
  } else {
    await build(opts.entry, opts);
  }
}
