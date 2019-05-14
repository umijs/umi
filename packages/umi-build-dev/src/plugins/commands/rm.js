import assert from 'assert';
import { existsSync } from 'fs';
import { join, relative, dirname, extname, basename } from 'path';
import rimraf from 'rimraf';

export default function(api) {
  const { paths, config, log } = api;

  function deleteFile(absPath) {
    rimraf.sync(absPath);
    log.success(`rm ${relative(api.cwd, absPath)}`);
  }

  function testAndDelete(absPath) {
    if (existsSync(absPath)) {
      deleteFile(absPath);
    }
  }

  function changePathExt(path, newExtname) {
    const dir = dirname(path);
    const oldExtname = extname(path);
    const base = basename(path, oldExtname);
    return join(dir, `${base}${newExtname}`);
  }

  function deletePage(name) {
    const jsPath = join(paths.cwd, name);
    console.log(`jsPath`, jsPath);

    if (existsSync(jsPath)) {
      deleteFile(jsPath);
      testAndDelete(changePathExt(jsPath, '.css'));
      testAndDelete(changePathExt(jsPath, '.less'));
      testAndDelete(changePathExt(jsPath, '.sass'));
      testAndDelete(changePathExt(jsPath, '.scss'));
    } else {
      throw new Error(`route component ${name} not found`);
    }
  }

  function rm(args) {
    assert(!config.routes, `umi rm is not supported now when routes is configured.`);
    assert(args._ && args._.length === 2, `Invalid args, checkout umi help rm for more details.`);
    const [type, name] = args._;

    switch (type) {
      case 'page':
        deletePage(name);
        break;
      default:
        throw new Error(`Type ${type} not supported, checkout umi help rm for more details`);
    }

    console.log('done');
  }

  api.registerCommand(
    'rm',
    {
      description: '[alpha] remove files quickly',
      usage: 'umi rm name args',
      options: {},
    },
    rm,
  );
}
