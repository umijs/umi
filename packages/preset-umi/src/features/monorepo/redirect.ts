import { chalk, isLocalDev, isMonorepo, logger, resolve } from '@umijs/utils';
import { pkgUp } from '@umijs/utils/compiled/pkg-up';
import assert from 'assert';
import { existsSync, statSync } from 'fs';
import { basename, dirname, join } from 'path';
// @ts-ignore
import { getPackages } from '../../../compiled/@manypkg/get-packages';
import type { IApi } from '../../types';

interface IConfigs {
  srcDir?: string[];
  exclude?: RegExp[];
  peerDeps?: boolean;
  useRootProject?: boolean;
}

export default (api: IApi) => {
  api.describe({
    key: 'monorepoRedirect',
    config: {
      schema({ zod }) {
        return zod.union([
          zod.boolean(),
          zod
            .object({
              srcDir: zod.array(zod.string()),
              exclude: zod.array(zod.instanceof(RegExp)),
              peerDeps: zod.boolean(),
            })
            .deepPartial(),
        ]);
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig(async (memo) => {
    const config: IConfigs = memo.monorepoRedirect || {};
    const {
      exclude = [],
      srcDir = ['src'],
      peerDeps = false,
      useRootProject = false,
    } = config;
    const currentProjectRoot = process.env.APP_ROOT ? process.cwd() : api.cwd;
    const rootPkg = await pkgUp({
      // APP_ROOT: https://github.com/umijs/umi/issues/9461
      cwd: useRootProject ? currentProjectRoot : dirname(currentProjectRoot),
    });
    if (!rootPkg) return memo;
    const root = dirname(rootPkg);
    assert(
      isMonorepo({ root }),
      `The 'monorepoRedirect' option can only be used in monorepo, you don't need configure.`,
    );

    // Note: not match `umi` package in local dev
    if (isLocalDev()) {
      logger.info(
        `[monorepoRedirect]: Auto excluded 'umi' package in local dev scene`,
      );
      exclude.push(/^umi$/);
    }
    // collect use workspace deps
    const usingDeps = collectPkgDeps(api.pkg).filter((name) => {
      return !exclude.some((reg) => reg.test(name));
    });
    if (!usingDeps.length) return memo;
    // collect all project
    const projects = await collectAllProjects({ root });
    const alias = usingDeps.reduce<Record<string, string>>((obj, name) => {
      const pkgInfo = projects[name];
      if (!pkgInfo) {
        return obj;
      }
      srcDir.some((dirName) => {
        const dirPath = join(pkgInfo.dir, dirName);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
          // redirect to source dir
          obj[name] = dirPath;
          return true;
        }
      });
      return obj;
    }, {});
    // collect peer deps
    const peerDepsAliasMap: Record<string, string> = {};
    if (peerDeps) {
      Object.entries(projects).forEach(([_name, pkgInfo]) => {
        const willResolveDeps: Record<string, string> =
          pkgInfo.packageJson?.peerDependencies || {};
        Object.keys(willResolveDeps).forEach((depName) => {
          // if already resolved, pass
          if (peerDepsAliasMap[depName]) {
            return;
          }
          // if in current monorepo, pass
          if (projects[depName]) {
            return;
          }
          // first resolve from current project
          const resolved = tryResolveDep({
            name: depName,
            from: currentProjectRoot,
          });
          if (resolved) {
            peerDepsAliasMap[depName] = resolved;
            return;
          }
          // then resolve from other project
          const resolvedFromOtherProject = tryResolveDep({
            name: depName,
            from: pkgInfo.dir,
          });
          if (resolvedFromOtherProject) {
            peerDepsAliasMap[depName] = resolvedFromOtherProject;
          }
          // if not found, pass
        });
        logger.debug(
          `[monorepoRedirect]: resolved peer deps ${Object.keys(
            peerDepsAliasMap,
          )
            .map((i) => chalk.green(i))
            .join(', ')} from ${basename(pkgInfo.dir)}`,
        );
      });
    }
    memo.alias = {
      ...memo.alias,
      ...peerDepsAliasMap,
      ...alias,
    };

    return memo;
  });
};

interface IOpts {
  root: string;
}

const DEP_KEYS = ['devDependencies', 'dependencies'];
function collectPkgDeps(pkg: Record<string, any>) {
  const deps: string[] = [];
  DEP_KEYS.forEach((type) => {
    deps.push(...Object.keys(pkg?.[type] || {}));
  });
  return deps;
}

interface IManyPkgPackageInfo {
  packageJson: Record<string, any>;
  dir: string;
}

async function collectAllProjects(opts: IOpts) {
  const workspaces = await getPackages(opts.root);
  return (workspaces.packages as IManyPkgPackageInfo[]).reduce<
    Record<string, IManyPkgPackageInfo>
  >((obj, pkg) => {
    const name = pkg.packageJson?.name;
    if (name) {
      obj[name] = pkg;
    }
    return obj;
  }, {});
}

function tryResolveDep(opts: { name: string; from: string }) {
  const { name, from } = opts;
  try {
    return dirname(
      resolve.sync(`${name}/package.json`, {
        basedir: from,
      }),
    );
  } catch {}
}
