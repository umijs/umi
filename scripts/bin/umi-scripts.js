#!/usr/bin/env node

const { join } = require('path')
const { existsSync } = require('fs')
const { sync } = require('@umijs/utils/compiled/cross-spawn')
const chalk = require('@umijs/utils/compiled/chalk').default
const assert = require('assert')

const argv = process.argv.slice(2)
const [name, ...throughArgs] = argv
const scriptsPath = join(__dirname, `../${name}.ts`)

assert(
  existsSync(scriptsPath) && !name.startsWith('.'),
  `Executed script '${chalk.red(name)}' does not exist`
)

console.log(chalk.cyan(`umi-scripts: ${name}\n`))

// current dir path may contain spaces
// https://github.com/umijs/umi/issues/9865
const scriptPathAsStr = JSON.stringify(scriptsPath)
const spawn = sync(
  'tsx',
  [scriptPathAsStr, ...throughArgs],
  {
    env: {
      ...process.env,
      // disable `(node:92349) ExperimentalWarning: `--experimental-loader` may be removed in the future;` warning
      // more context: https://github.com/umijs/umi/pull/11981
      NODE_NO_WARNINGS: '1'
    },
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  }
)
if (spawn.status !== 0) {
  console.log(chalk.red(`umi-scripts: ${name} execute fail`))
  process.exit(1)
}
