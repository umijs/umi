import { chalk } from '@umijs/utils';
import fs from 'fs-extra';
import { basename, extname, join } from 'path';
import { eachPkg, getPkgs } from './.internal/utils';

const readDir = (p: string) => {
  return fs
    .readdirSync(p)
    .filter((file) => !['.DS_Store', 'node_modules'].includes(file))
    .map((file) => join(p, file));
};

const visitFiles = (opts: {
  dir: string;
  onVisit: (filename: string) => any;
}) => {
  readDir(opts.dir).forEach((file) => {
    if (fs.statSync(file).isDirectory()) {
      return visitFiles({
        dir: file,
        onVisit: opts.onVisit,
      });
    }
    const ext = extname(file);
    if (['.js', '.mjs', '.cjs', '.ts'].includes(ext)) {
      opts.onVisit(file);
    }
  });
};

const check = async () => {
  eachPkg(getPkgs(), async ({ dir, pkgJson, pkgPath }) => {
    // Check all project source, ensure not use myself package name import.
    const pkgName = pkgJson.name as string;
    if (pkgName.startsWith('@umijs')) {
      console.log(`Check ${chalk.green(pkgName)} phantom deps`);
      visitFiles({
        dir,
        onVisit: (file) => {
          const content = fs.readFileSync(file, 'utf-8');

          const phantomKeywords = [
            `require('${pkgName}`,
            `require("${pkgName}`,
            `require.resolve('${pkgName}`,
            `require.resolve("${pkgName}`,
            `from "${pkgName}`,
            `from '${pkgName}`,
          ];

          const hasSelfPkgString = phantomKeywords.some((keyword) =>
            content.includes(keyword),
          );
          if (hasSelfPkgString) {
            console.log(
              `In ${chalk.red(pkgName)} > ${basename(
                file,
              )} > import self pkg name`,
            );
            console.log(`> ${file}`);
            console.log();
            throw new Error();
          }
        },
      });
    }

    // Check all project package.json, ensure prebundle external list use deps installed.
    const compiledDir = join(dir, 'compiled');
    if (fs.existsSync(compiledDir)) {
      const external: Record<string, string> =
        pkgJson?.['compiledConfig']?.['externals'] || {};
      const deps = pkgJson?.['dependencies'] || {};
      Object.entries(external).forEach(([depName, pos]) => {
        if (pos.startsWith('@umijs')) {
          const posPkgName = pos.split('/').slice(0, 2).join('/');
          if (pkgName === posPkgName) {
            console.log(
              `In ${pkgName} > should use $$LOCAL mark for external dep ${depName}`,
            );
            throw new Error();
          }
          console.log(
            `${chalk.green(pkgName)} should install ${chalk.yellow(
              posPkgName,
            )}`,
          );
          const installed = Boolean(deps?.[posPkgName]);
          if (!installed) {
            console.log(
              `In ${pkgName} > use external dep ${chalk.red(
                posPkgName,
              )} not add to dependencies`,
            );
            console.log(`> ${pkgPath}`);
            console.log();
            throw new Error();
          }
        }
      });
    }
  });
};

check();
