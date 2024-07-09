import fs from 'fs';
import path from 'path';

const base = path.join(__dirname, '../bundles/webpack/');
const deepImportsPath = path.join(base, 'packages/deepImports.json');
const files = require(deepImportsPath);

// uniq and sort
const uniqFiles = Array.from(new Set(files));
fs.writeFileSync(deepImportsPath, JSON.stringify(uniqFiles, null, 2), 'utf-8');

const nameMap = {
  'create-schema-validation': 'createSchemaValidation',
  'JavascriptHotModuleReplacement.runtime':
    'JavascriptHotModuleReplacementRuntime',
  'ExternalsType.check': 'ExternalsTypeCheck',
  'ConsumeSharedPlugin.check': 'ConsumeSharedPluginCheck',
  'ConsumeSharedPlugin.json': 'ConsumeSharedPluginJson',
};
// write template files
uniqFiles.forEach((file) => {
  const name = path.basename(file);
  const importName = nameMap[name] || name;
  if (importName.includes('.') || importName.includes('-')) {
    throw new Error(`Invalid import name: ${importName}`);
  }
  const isJson = name.endsWith('.json');
  if (isJson) {
    console.log(chalk.green(`Write packages/${name}`));
    const content = require(file);
    fs.writeFileSync(
      path.join(base, 'packages', name),
      JSON.stringify(content, null, 2),
      'utf-8',
    );
  } else {
    console.log(chalk.green(`Write packages/${name}.js`));
    fs.writeFileSync(
      path.join(base, 'packages', `${name}.js`),
      `module.exports = require('./').${importName};\n`,
      'utf-8',
    );
  }
});
