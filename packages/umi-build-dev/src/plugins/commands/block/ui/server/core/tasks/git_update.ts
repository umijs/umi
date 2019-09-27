import assert from 'assert';
import { winPath } from 'umi-utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { IFlowContext, ICtxTypes, IAddBlockOption } from '../types';
import { getNameFromPkg } from '../../../../getBlockGenerator';

const isSubmodule = templateTmpDirPath => existsSync(join(templateTmpDirPath, '.gitmodules'));

const addPrefix = path => {
  if (!/^\//.test(path)) {
    return `/${path}`;
  }
  return path;
};

const clone = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { logger, execa } = ctx;

  const { branch, templateTmpDirPath, sourcePath, routePath } = ctx.stages.blockCtx as ICtxTypes;

  logger.start('🚒  Git fetch');
  try {
    await execa('git', ['fetch'], {
      cwd: templateTmpDirPath,
    });
  } catch (e) {
    logger.fail();
    throw new Error(e);
  }
  logger.succeed();

  logger.start(`🚛  Git checkout ${branch}`);

  try {
    await execa('git', ['checkout', branch], {
      cwd: templateTmpDirPath,
    });
  } catch (e) {
    logger.fail();
    throw new Error(e);
  }
  logger.succeed();

  logger.start('🚀  Git pull');
  try {
    await execa('git', ['pull'], {
      cwd: templateTmpDirPath,
    });
    // 如果是 git pull 之后有了
    // git module 只能通过这种办法来初始化一下
    if (isSubmodule(templateTmpDirPath)) {
      // 结束  git pull 的 spinner
      logger.succeed();

      // 如果是分支切换过来，可能没有初始化，初始化一下
      await execa('git', ['submodule', 'init'], {
        cwd: templateTmpDirPath,
        env: process.env,
      });

      logger.start('👀  update submodule');
      await execa('git', ['submodule', 'update', '--recursive'], {
        cwd: templateTmpDirPath,
      });
    }
  } catch (e) {
    logger.fail();
    throw new Error(e);
  }
  logger.succeed();

  assert(existsSync(sourcePath), `${sourcePath} don't exists`);

  let pkg;
  // get block's package.json
  const pkgPath = join(sourcePath, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`not find package.json in ${this.sourcePath}`);
  } else {
    // eslint-disable-next-line
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    ctx.stages.blockCtx.pkg = pkg;
  }

  // setup route path
  const { path } = args;
  let filePath = '';
  if (!path) {
    const blockName = getNameFromPkg(pkg);
    if (!blockName) {
      logger.error("not find name in block's package.json");
      ctx.terminated = true;
      ctx.terminatedMsg = "not find name in block's package.json";
      return;
    }

    filePath = `/${blockName}`;
    // logger(`Not find --path, use block name
    // '${ctx.stages.blockCtx.filePath}' as the target path.`);
  } else {
    filePath = winPath(path);
  }

  ctx.stages.blockCtx.filePath = addPrefix(filePath);

  // 如果 ctx.routePath 不存在，使用 filePath
  if (!routePath) {
    ctx.stages.blockCtx.routePath = filePath;
  }

  ctx.stages.blockCtx.routePath = addPrefix(ctx.stages.blockCtx.routePath);
};

export default clone;
