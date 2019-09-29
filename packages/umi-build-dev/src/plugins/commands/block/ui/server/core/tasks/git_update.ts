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

  logger.appendLog('Start git fetch');
  try {
    await execa('git', ['fetch'], {
      cwd: templateTmpDirPath,
    });
  } catch (e) {
    logger.appendLog(`Faild git fetch: ${e.message}`);
    throw new Error(e);
  }
  logger.appendLog('Success git fetch\n');

  logger.appendLog(`Start git checkout ${branch}`);
  try {
    await execa('git', ['checkout', branch], {
      cwd: templateTmpDirPath,
    });
  } catch (e) {
    logger.appendLog(`Faild git checkout: ${e.message}\n`);
    throw new Error(e);
  }

  logger.appendLog(`Success git checkout ${branch}\n`);

  logger.appendLog('Start git pull');

  try {
    await execa('git', ['pull'], {
      cwd: templateTmpDirPath,
    });
    // 如果是 git pull 之后有了
    // git module 只能通过这种办法来初始化一下
    if (isSubmodule(templateTmpDirPath)) {
      // 结束  git pull 的 spinner

      // 如果是分支切换过来，可能没有初始化，初始化一下
      await execa('git', ['submodule', 'init'], {
        cwd: templateTmpDirPath,
        env: process.env,
      });

      await execa('git', ['submodule', 'update', '--recursive'], {
        cwd: templateTmpDirPath,
      });
    }
  } catch (e) {
    if (e.killed) {
      const err = new Error('Cancel git pull');
      err.name = 'GitUpdateError';
      logger.appendLog('Cancel git pull\n');
      throw err;
    }
    logger.appendLog(`Faild git pull: ${e.message || ''}\n`);
    throw e;
  }

  logger.appendLog('Success git pull\n');

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
      const errMsg = "Can not find name in block's package.json";
      logger.appendLog(errMsg);
      ctx.terminated = true;
      ctx.terminatedMsg = errMsg;
      return;
    }

    filePath = `/${blockName}`;
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
