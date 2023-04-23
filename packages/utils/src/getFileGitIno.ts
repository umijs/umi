import type { SpawnOptions } from 'child_process';
import crossSpawn from '../compiled/cross-spawn';
import { execa } from '../compiled/execa';

const promisifySpawn = (
  cmd: string,
  args: string[],
  {
    onlyOnce,
    ...rest
  }: {
    onlyOnce?: boolean;
  } & SpawnOptions,
) =>
  new Promise<string[]>((resolve, reject) => {
    const cp = crossSpawn(cmd, args, rest);
    const error: string[] = [];
    const stdout: string[] = [];

    cp.stdout?.on('data', (data: Buffer) => {
      stdout.push(data.toString());
      if (onlyOnce) {
        cp.kill('SIGKILL');
      }
    });

    cp.on('error', (e) => {
      error.push(e.toString());
    });

    cp.on('close', () => {
      if (error.length) {
        reject(error.join(''));
      } else {
        resolve(stdout);
      }
    });
  });

export interface ICreateInfo {
  createTime?: string;
  creator?: string;
  creatorEmail?: string;
  createSince?: string;
}
export interface IModifyInfo {
  modifyTime?: string;
  modifier?: string;
  modifierEmail?: string;
  modifySince?: string;
}
/**
 * 获取文件创建信息
 * @param filePath 文件路径，绝对或相对 .git
 * @param gitDirPath .git路径
 * @returns
 */
export const getFileCreateInfo = async (
  filePath: string,
  gitDirPath?: string,
) => {
  try {
    const info = await promisifySpawn(
      'git',
      // time|name|email|since
      ['log', '--reverse', '-1000000', "--pretty='%ad|%an|%ae|%ar'", filePath],
      {
        cwd: gitDirPath,
        onlyOnce: true,
        shell: true,
      },
    );
    if (info.length && info[0]) {
      const firstCommit = info[0].slice(0, info[0].indexOf('\n')).split('|');
      return {
        createTime: firstCommit.at(0),
        creator: firstCommit.at(1),
        creatorEmail: firstCommit.at(2),
        createSince: firstCommit.at(3),
      };
    } else {
      return {};
    }
  } catch (err) {
    throw new Error(`get file ${filePath} git info failed`);
  }
};

/**
 * 获取文件最新修改信息
 * @param filePath 文件路径，绝对或相对 .git
 * @param gitDirPath .git路径
 * @returns
 */
export const getFileLastModifyInfo = async (
  filePath: string,
  gitDirPath?: string,
) => {
  try {
    const info = await promisifySpawn(
      'git',
      ['log', '-1', "--pretty='%ad|%an|%ae|%ar'", filePath],
      {
        cwd: gitDirPath,
        onlyOnce: true,
        shell: true,
      },
    );

    if (info.length && info[0]) {
      const firstCommit = info[0].slice(0, info[0].indexOf('\n')).split('|');
      return {
        modifyTime: firstCommit.at(0),
        modifier: firstCommit.at(1),
        modifierEmail: firstCommit.at(2),
        modifySince: firstCommit.at(3),
      };
    } else {
      return {};
    }
  } catch (err) {
    throw new Error(`get file ${filePath} git info failed`);
  }
};

export const isGitRepo = async () => {
  try {
    const res = await execa('git', ['rev-parse', '--is-inside-work-tree']);
    return res.stdout.includes('true');
  } catch (e) {
    return false;
  }
};
