const { existsSync, writeFileSync, readdirSync } = require('fs');
const { join } = require('path');
const mkdirp = require('mkdirp');
const { yParser } = require('@umijs/utils');
const getPackages = require('./utils/getPackages');

(async () => {
  const args = yParser(process.argv);

  const pkgs = getPackages('../../examples');

  pkgs.forEach(async (shortName) => {

    const pkgJSONPath = join(
      __dirname,
      '..',
      'examples',
      shortName,
      'package.json',
    );
    const pkgJSONExists = existsSync(pkgJSONPath);
    if (args.force || !pkgJSONExists) {
      const json = {
        name: shortName,
        version: '0.0.1',
        description: shortName,
        scripts: {
          start: "umi dev",
          build: "umi build"
        },
        repository: {
          type: 'git',
          url: 'https://github.com/umijs/umi',
        },
        keywords: ['umi', 'umi examples'],
        authors: ['chencheng <sorrycc@gmail.com> (https://github.com/sorrycc)'],
        license: 'MIT',
        dependencies: {
          umi: "latest"
        },
        bugs: 'http://github.com/umijs/umi/issues',
        homepage: `https://github.com/umijs/umi/tree/master/examples/${shortName}#readme`,
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

    const readmePath = join(
      __dirname,
      '..',
      'examples',
      shortName,
      'README.md',
    );
    if (args.force || !existsSync(readmePath)) {
      writeFileSync(readmePath, `# ${shortName}\n\nTODO\n\n## How to use\n\nExecute [\`@umijs/create-umi-app\`](https://github.com/umijs/umi/tree/master/packages/create-umi-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:\n\n\`\`\`bash\nnpx @umijs/create-umi-app --example ${shortName} ${shortName}-app\n# or\nyarn create @umijs/umi-app --example ${shortName} ${shortName}-app\n\`\`\`\n`);
    } else {
      return;
    }

    const indexPath = join(
      __dirname,
      '..',
      'examples',
      shortName,
      'pages',
      'index.tsx',
    );
    if (!existsSync(indexPath)) {
      await mkdirp(join(indexPath, '..'));
      writeFileSync(indexPath, `import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (<div>Index Page</div>);
}

export default IndexPage;

`);
    }
  });
})();
