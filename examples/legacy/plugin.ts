import assert from 'assert';
import { spawnSync } from 'child_process';
import { join } from 'path';
import type { IApi } from 'umi';

export default (api: IApi) => {
  api.onBuildHtmlComplete(() => {
    const outputDir = join(api.cwd, 'dist');
    const { status } = spawnSync(
      require.resolve('es-check'),
      ['es5', join(outputDir, '**/*.js')],
      {
        stdio: 'inherit',
        cwd: api.cwd,
      },
    );
    assert(status === 0, 'es-check es5 failed');
  });
};
