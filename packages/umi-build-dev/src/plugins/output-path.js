import assert from 'assert';
import { join } from 'path';

export default function(api) {
  const { paths, config } = api.service;

  api.register('onStart', () => {
    if (config.outputPath) {
      paths.outputPath = config.outputPath;
      paths.absOutputPath = join(paths.cwd, config.outputPath);
    }
  });

  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(() => {
      return {
        name: 'outputPath',
        validate(val) {
          assert(
            typeof val === 'string',
            `Configure item outputPath should be String, but got ${val}.`,
          );
        },
      };
    });
    return memo;
  });
}
