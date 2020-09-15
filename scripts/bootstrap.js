const { existsSync, writeFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { yParser } = require('@umijs/utils');
const getPackages = require('./utils/getPackages');

(async () => {
  const args = yParser(process.argv);
  const version = require('../lerna.json').version;

  const pkgs = getPackages();

  pkgs.forEach((shortName) => {
    const name = shortName === 'umi' ? shortName : `@umijs/${shortName}`;

    const pkgJSONPath = join(
      __dirname,
      '..',
      'packages',
      shortName,
      'package.json',
    );
    const pkgJSONExists = existsSync(pkgJSONPath);
    if (args.force || !pkgJSONExists) {
      const json = {
        name,
        version,
        description: name,
        main: 'lib/index.js',
        types: 'lib/index.d.ts',
        files: ['lib', 'src'],
        repository: {
          type: 'git',
          url: 'https://github.com/umijs/umi',
        },
        keywords: ['umi'],
        authors: ['chencheng <sorrycc@gmail.com> (https://github.com/sorrycc)'],
        license: 'MIT',
        bugs: 'http://github.com/umijs/umi/issues',
        homepage: `https://github.com/umijs/umi/tree/master/packages/${shortName}#readme`,
        publishConfig: {
          access: 'public',
        },
      };
      if (pkgJSONExists) {
        const pkg = require(pkgJSONPath);
        [
          'dependencies',
          'devDependencies',
          'peerDependencies',
          'bin',
          'files',
          'authors',
          'types',
          'sideEffects',
          'main',
          'module',
        ].forEach((key) => {
          if (pkg[key]) json[key] = pkg[key];
        });
      }
      writeFileSync(pkgJSONPath, `${JSON.stringify(json, null, 2)}\n`);
    }

    if (shortName !== 'umi') {
      const readmePath = join(
        __dirname,
        '..',
        'packages',
        shortName,
        'README.md',
      );
      if (args.force || !existsSync(readmePath)) {
        writeFileSync(readmePath, `# ${name}\n`);
      }
    }
  });
})();
