#!/usr/bin/env node

const resolveCwd = require('resolve-cwd');

const localCLI = resolveCwd.silent('umi/bin/umi');
require('../lib/cli');
