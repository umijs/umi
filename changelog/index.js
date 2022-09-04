'use strict'
// 原始模板参考
// https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
const Q = require('q')

const writerOpts = require('./writer-opts')
const gitRawCommitsOpts = require('./git-raw-commit');

module.exports = Q.all([writerOpts, gitRawCommitsOpts])
  .spread((writerOpts, gitRawCommitsOpts) => {
    return { writerOpts, gitRawCommitsOpts }
  })
