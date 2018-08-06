#!/usr/bin/env node

const spawn = require('cross-spawn');
const chalk = require('chalk');
const { join, dirname } = require('path');
const { existsSync } = require('fs');
const Service = require('umi-build-dev/lib/Service').default;

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
  if (isFork) {
    const reportData = getReportData(script);
    const child = spawn.sync(
      'node',
      [require.resolve(`../lib/scripts/${script}`)].concat(args),
      {stdio: 'inherit'} // eslint-disable-line
    );
    report(script, reportData, child.status).finally(() => { // 保证 monitor 上传数据完成后再退出进程
      process.exit(child.status);
    });
  } else {
    require(`../lib/scripts/${script}`);
  }
}

process.env.UMI_DIR = dirname(require.resolve('../package'));

const scriptAlias = {
  g: 'generate' // eslint-disable-line
};
const aliasedScript = scriptAlias[script] || script;

switch (aliasedScript) {
  case '-v':
  case '--version':
    console.log(pkg.version);
    if (existsSync(join(__dirname, '../.local'))) {
      console.log(chalk.cyan('@local'));
    }
    break;
  case 'build':
  case 'dev':
    runScript(aliasedScript, args, /* isFork */true);
    break;
  case 'test':
    runScript(aliasedScript, args);
    break;
  default:
    new Service(
      require('../lib/buildDevOpts').default()
    ).run(script);
    break;
}

function getReportData(script) {
  return (script === 'dev' && getDevData()) || (script === 'build' && getBuildData());
}

function report(script, reportData, status) {
  if (script === 'dev') {
    const { appData, appExtraData, devData, devExtraData } = reportData;
    return reportDev(appData, appExtraData, devData, devExtraData, status);
  } else if (script === 'build') {
    const { buildData, extraData } = reportData;
    return reportBuild(buildData, extraData, status);
  }
}

function getDevData() {
  const appData = {
    reportFrom: 'umi',
  };
  const appExtraData = {
    umiVersion: require('../package.json').version,
    antdVersion: require(dirname(require.resolve('antd/package.json'))).version,
  };
  const devData = {
    reportFrom: 'umi',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      UMI_ENV: process.env.UMI_ENV,
    },
    startTime: Date.now(),
  };
  const devExtraData = {
    umiVersion: require('../package.json').version,
  };
  return { appData, appExtraData, devData, devExtraData };
}

function getBuildData() {
  const buildData = {
    reportFrom: 'umi',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      UMI_ENV: process.env.UMI_ENV,
    },
    startTime: Date.now(),
  };
  const extraData = {
    umiVersion: require('../package.json').version,
  };
  return { buildData, extraData };
}

// 上报 app + dev 信息
function reportDev(appData, appExtraData, devData, devExtraData, status = 0) {
  const newDevData = Object.assign(devData, {
    endTime: Date.now(),
    status: status === 0 ? 'success' : 'fail',
  });
  return require('atool-monitor').reportData(appData, appExtraData, newDevData, devExtraData);
}

// 上报构建信息
function reportBuild(buildData, extraData, status = 0) {
  const newBuildData = Object.assign(buildData, {
    endTime: Date.now(),
    status: status === 0 ? 'success' : 'fail',
  });
  return require('atool-monitor').reportBuildData(newBuildData, extraData);
}
