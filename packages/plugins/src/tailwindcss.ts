import { exec } from 'child_process';
import * as path from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({ key: 'tailwindcss' });

  api.onStart(() => {
    const inputPath = path.resolve(api.cwd, 'tailwind.css');
    const generatedPath = path.resolve(api.paths.absTmpPath, 'tailwind.css');
    const binPath = path.resolve(api.cwd, 'node_modules/.bin/tailwind');

    /** 透过子进程建立 tailwindcss 服务，将生成的 css 写入 generatedPath */
    const tailwind = exec(
      `${binPath} -i ${inputPath} -o ${generatedPath} --watch`,
      { cwd: api.cwd },
    );

    tailwind.on('error', (m: any) => {
      api.logger.error('tailwindcss service encounter an error: ' + m);
    });

    /** 将生成的 css 文件加入到 import 中 */
    api.addEntryImports(() => [{ source: generatedPath }]);
  });
};
