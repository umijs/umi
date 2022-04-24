#!/usr/bin/env node

const { join } = require('path')
const { existsSync } = require('fs')
const { fork } = require('child_process')
const assert = require('assert')
const esno = require.resolve('esno/esno')

const argv = process.argv.slice(2)
const name = argv[0]
const scriptsPath = join(__dirname, `../${name}.ts`)

assert(existsSync(scriptsPath) && !name.startsWith('.'), `Executed script '${name}' does not exist`)

console.log(`umi-scripts: ${name}\n`)

fork(esno, [scriptsPath, ...argv.slice(1)], { env: process.env, cwd: process.cwd() })
