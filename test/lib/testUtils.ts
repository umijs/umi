import { execa } from '@umijs/utils/compiled/execa';
import { ensureDir, existsSync, readFile, remove, writeFile } from 'fs-extra';
import { dirname, join, resolve } from 'path';

export function createUmi(opts: { name: string; cwd: string }) {
  const projectRoot = resolve(opts.cwd, opts.name);

  const read = (file: string) => {
    return readFile(resolve(projectRoot, file), 'utf-8');
  };

  const has = (file: string) => {
    return existsSync(resolve(projectRoot, file));
  };

  const write = (file: string, content: string) => {
    const targetPath = resolve(projectRoot, file);
    const dir = dirname(targetPath);
    return ensureDir(dir).then(() => writeFile(targetPath, content));
  };

  const rm = (file: string) => {
    return remove(resolve(projectRoot, file));
  };

  const build = () => {
    const command = require.resolve('umi/bin/umi');
    return execa(command, ['build'], {
      cwd: projectRoot,
    });
  };

  const getIndex = () => {
    return `file:${join(projectRoot, 'dist/index.html')}`;
  };

  return {
    projectRoot,
    read,
    has,
    write,
    rm,
    build,
    getIndex,
  };
}
