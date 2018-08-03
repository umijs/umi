import assert from 'assert';
import { join } from 'path';

export default function(api) {
  const { paths, config } = api;

  api.onStart(() => {
    if (config.outputPath) {
      paths.outputPath = config.outputPath;
      paths.absOutputPath = join(paths.cwd, config.outputPath);
    }
  });

  api._registerConfig(() => {
    return () => {
      return {
        name: 'outputPath',
        validate(val) {
          assert(
            typeof val === 'string',
            `Configure item outputPath should be String, but got ${val}.`,
          );
        },
      };
    };
  });
}
