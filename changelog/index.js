'use strict'
// 原始模板参考
// https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
const Q = require('q')
const conventionalChangelog = require('./conventional-changelog')
const parserOpts = require('./parser-opts')
const recommendedBumpOpts = require('./conventional-recommended-bump')
const writerOpts = require('./writer-opts')
const gitRawCommitsOpts = require('./git-raw-commit');

module.exports = Q.all([conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts, gitRawCommitsOpts])
  .spread((conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts, gitRawCommitsOpts) => {
    return { conventionalChangelog, parserOpts, recommendedBumpOpts, writerOpts, gitRawCommitsOpts }
  })
