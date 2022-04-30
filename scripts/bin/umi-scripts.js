#!/usr/bin/env node

const { join } = require('path')
const { existsSync } = require('fs')
const { sync } = require('@umijs/utils/compiled/cross-spawn')
const chalk = require('@umijs/utils/compiled/chalk').default
const assert = require('assert')

const argv = process.argv.slice(2)
const name = argv[0]
const scriptsPath = join(__dirname, `../${name}.ts`)

assert(
  existsSync(scriptsPath) && !name.startsWith('.'),
  `Executed script '${chalk.red(name)}' does not exist`
)

console.log(chalk.cyan(`umi-scripts: ${name}\n`))

const spawn = sync(
  'esno',
  [scriptsPath, ...argv.slice(1)],
  {
    env: process.env,
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  }
)
if (spawn.status !== 0) {
  console.log(chalk.red(`umi-scripts: ${name} execute fail`))
  process.exit(1)
}
