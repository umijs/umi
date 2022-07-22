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

// for pass all params
// e.g. umi-scripts bundleDeps --dep chalk
//                             ^ pass all => -- --dep chalk
//      argv.slice(2) <in bundleDeps.ts> : --dep chalk
if (throughArgs.length) {
  throughArgs.unshift('--')
}

const spawn = sync(
  'tsx',
  [scriptsPath, ...throughArgs],
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
