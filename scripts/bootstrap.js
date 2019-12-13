const { existsSync, writeFileSync } = require('fs');
const { join } = require('path');
const { getPackages } = require(`@lerna/project`);
const yParser = require('yargs-parser');

(async () => {
  const args = yParser(process.argv);
  const pkgNames = await getPackages();
  const version = require('../lerna.json').version;

  pkgNames.forEach(({ name }) => {
    const [_scope, shortName] = name.split('/');

    const pkgJSONPath = join(__dirname, '..', 'packages', shortName, 'package.json');
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
      };
      if (pkgJSONExists) {
        const pkg = require(pkgJSONPath);
        if (pkg.dependencies) json.dependencies = pkg.dependencies;
        if (pkg.devDependencies) json.devDependencies = pkg.devDependencies;
        if (pkg.peerDependencies) json.peerDependencies = pkg.peerDependencies;
        if (pkg.bin) json.bin = pkg.bin;
      }
      writeFileSync(pkgJSONPath, `${JSON.stringify(json, null, 2)}\n`);
    }

    const readmePath = join(__dirname, '..', 'packages', shortName, 'README.md');
    if (args.force || !existsSync(readmePath)) {
      writeFileSync(readmePath, `# ${name}\n`);
    }
  });
})();
