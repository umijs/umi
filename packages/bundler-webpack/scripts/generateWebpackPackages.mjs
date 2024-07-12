import { join } from 'path';

const base = join(__dirname, '../bundles/webpack/');
const files = require(join(base, 'packages/deepImports.json'));

files.forEach((file) => {
  const name = file.split('/').slice(-1)[0];
  console.log(chalk.green(`Write packages/${name}.js`));
  fs.writeFileSync(
    join(base, 'packages', `${name}.js`),
    `module.exports = require('./').${name};\n`,
    'utf-8',
  );
});
