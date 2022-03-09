// @ts-ignore
import { getPackages } from '../../../compiled/@manypkg/get-packages';
import { logger } from '@umijs/utils';
import { pkgUp } from '@umijs/utils/compiled/pkg-up';
import assert from 'assert';
import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import type { IApi } from '../../types';

interface IConfigs {
  srcDir?: string[];
  exclude?: RegExp[];
}

export default (api: IApi) => {
  api.describe({
    key: 'monorepoRedirect',
    config: {
      schema(Joi) {
        return Joi.alternatives(
          Joi.boolean(),
          Joi.object({
            srcDir: Joi.array().items(Joi.string()),
            exclude: Joi.array().items(Joi.object().instance(RegExp)),
          }),
        );
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig(async (memo) => {
    const rootPkg = await pkgUp({ cwd: dirname(api.cwd) });
    if (!rootPkg) return memo;
    const root = dirname(rootPkg);
    assert(
      isMonorepo({ root }),
      `The 'monorepoRedirect' option can only be used in monorepo, you don't need configure.`,
    );

    const config: IConfigs = memo.monorepoRedirect || {};
    const { exclude = [], srcDir = ['src'] } = config;
    // Note: not match `umi` package in local dev
    if (__filename.includes(`packages/preset-umi`)) {
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
      const root = projects[name];
      if (!root) {
        return obj;
      }
      srcDir.some((dirName) => {
        const dirPath = join(root, dirName);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
          // redirect to source dir
          obj[name] = dirPath;
          return true;
        }
      });
      return obj;
    }, {});
    memo.alias = {
      ...memo.alias,
      ...alias,
    };

    return memo;
  });
};

interface IOpts {
  root: string;
}

interface IProject {
  packageJson: Record<string, any>;
  dir: string;
}

const DEP_KEYS = ['devDependencies', 'dependencies'];
function collectPkgDeps(pkg: Record<string, any>) {
  const deps: string[] = [];
  DEP_KEYS.forEach((type) => {
    deps.push(...Object.keys(pkg?.[type] || {}));
  });
  return deps;
}

async function collectAllProjects(opts: IOpts) {
  const workspaces = await getPackages(opts.root);
  return workspaces.packages.reduce<Record<string, string>>(
    (obj: Record<string, string>, pkg: IProject) => {
      const name = pkg.packageJson?.name;
      if (name) {
        obj[name] = pkg.dir;
      }
      return obj;
    },
    {},
  );
}

const MONOREPO_FILE = ['pnpm-workspace.yaml', 'lerna.json'];
function isMonorepo(opts: IOpts) {
  const pkgExist = existsSync(join(opts.root, 'package.json'));
  return (
    pkgExist &&
    MONOREPO_FILE.some((file) => {
      return existsSync(join(opts.root, file));
    })
  );
}
