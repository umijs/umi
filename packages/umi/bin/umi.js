#!/usr/bin/env node

const spawn = require('cross-spawn');
const chalk = require('chalk');
// const yParser = require('yargs-parser');

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

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg: pkg }).notify({ defer: true });

function runScript(script, args, isFork) {
  // const options= yParser(args);
  if(script === 'help' || args.help || args.h){
    require(`../lib/scripts/help`)
  }else if (isFork) {
    const result = spawn.sync(
      'node',
      [require.resolve(`../lib/scripts/${script}`)].concat(args),
      {stdio: 'inherit'} // eslint-disable-line
    );
    process.exit(result.status);
  } else {
    require(`../lib/scripts/${script}`);
  }
}

// Script area
const scriptAlias = {
  g: 'generate' // eslint-disable-line
};
const aliasedScript = scriptAlias[script] || script;

switch (aliasedScript) {
  case '-v':
  case '--version':
    console.log(pkg.version);
    if (!(pkg._from && pkg._resolved)) {
      console.log(chalk.cyan('@local'));
    }
    break;
  case 'build':
  case 'dev':
  case 'generate':
  case 'new':
    runScript(aliasedScript, args, /* isFork */true);
    break;
  case 'help':  
  case 'test':
    runScript(aliasedScript, args);
    break;
  default:
    runScript('help', args);
    break;
}
