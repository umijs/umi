#!/usr/bin/env node

const spawn = require('cross-spawn');

const script = process.argv[2];
const args = process.argv.slice(3);

const nodeVersion = process.versions.node;
const versions = nodeVersion.split('.');
const major = versions[0];
const minor = versions[1];

if (major * 10 + minor * 1 < 65) {
  console.log(`Node version must >= 6.5, but got ${major}.${minor}`);
  process.exit(1);
}

function runScript(script, args) {
  const result = spawn.sync(
    'node',
    [require.resolve(`../lib/scripts/${script}`)].concat(args),
    { stdio: 'inherit' } // eslint-disable-line
  );
  process.exit(result.status);
}

const scriptAlias = {
  g: 'generate',
};
const aliasedScript = scriptAlias[script] || script;

switch (aliasedScript) {
  case '-v':
  case '--version':
    console.log(require('../package.json').version);
    break;
  case 'build':
  case 'dev':
  case 'test':
  case 'generate':
    runScript(aliasedScript, args);
    break;
  default:
    break;
}
