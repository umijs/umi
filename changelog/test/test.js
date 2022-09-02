'use strict'
const conventionalChangelogCore = require('conventional-changelog-core')
const preset = require('../')
const expect = require('chai').expect
const through = require('through2')
const path = require('path')
const fs = require('fs')
const tmp = require('tmp')
const { gitInit, gitDummyCommit, exec } = require('../../../tools/test-tools')
const betterThanBefore = require('better-than-before')()
const preparing = betterThanBefore.preparing

betterThanBefore.setups([
  function () {
    const tmpDir = tmp.dirSync()
    process.chdir(tmpDir.name)
    gitInit()
    fs.writeFileSync('./package.json', JSON.stringify({
      name: 'conventional-changelog-core',
      repository: {
        type: 'git',
        url: 'https://github.com/conventional-changelog/conventional-changelog.git'
      }
    }))

    gitDummyCommit(['build: first build setup', 'BREAKING CHANGE: New build system.'])
    gitDummyCommit(['ci(travis): add TravisCI pipeline', 'BREAKING CHANGE: Continuously integrated.'])
    gitDummyCommit(['feat: amazing new module', 'BREAKING CHANGE: Not backward compatible.'])
    gitDummyCommit(['fix(compile): avoid a bug', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['perf(ngOptions): make it faster', ' closes #1, #2'])
    gitDummyCommit('revert(ngOptions): bad commit')
    gitDummyCommit('fix(*): oops')
  },
  function () {
    gitDummyCommit(['feat(awesome): addresses the issue brought up in #133'])
  },
  function () {
    gitDummyCommit(['feat(awesome): fix #88'])
  },
  function () {
    gitDummyCommit(['feat(awesome): issue brought up by @bcoe! on Friday'])
  },
  function () {
    gitDummyCommit(['build(npm): edit build script', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['ci(travis): setup travis', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['docs(readme): make it clear', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['style(whitespace): make it easier to read', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['refactor(code): change a lot of code', 'BREAKING CHANGE: The Change is huge.'])
    gitDummyCommit(['test(*): more tests', 'BREAKING CHANGE: The Change is huge.'])
  },
  function () {
    exec('git tag v1.0.0')
    gitDummyCommit('feat: some more features')
  },
  function () {
    gitDummyCommit(['feat(*): implementing #5 by @dlmr', ' closes #10'])
  },
  function () {
    gitDummyCommit(['fix: use npm@5 (@username)'])
    gitDummyCommit(['build(deps): bump @dummy/package from 7.1.2 to 8.0.0', 'BREAKING CHANGE: The Change is huge.'])
  },
  function () {
    gitDummyCommit(['Revert \\"feat: default revert format\\"', 'This reverts commit 1234.'])
    gitDummyCommit(['revert: feat: custom revert format', 'This reverts commit 5678.'])
  }
])

describe('angular preset', function () {
  it('should work if there is no semver tag', function (done) {
    preparing(1)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.include('first build setup')
        expect(chunk).to.include('**travis:** add TravisCI pipeline')
        expect(chunk).to.include('**travis:** Continuously integrated.')
        expect(chunk).to.include('amazing new module')
        expect(chunk).to.include('**compile:** avoid a bug')
        expect(chunk).to.include('make it faster')
        expect(chunk).to.include(', closes [#1](https://github.com/conventional-changelog/conventional-changelog/issues/1) [#2](https://github.com/conventional-changelog/conventional-changelog/issues/2)')
        expect(chunk).to.include('New build system.')
        expect(chunk).to.include('Not backward compatible.')
        expect(chunk).to.include('**compile:** The Change is huge.')
        expect(chunk).to.include('Build System')
        expect(chunk).to.include('Continuous Integration')
        expect(chunk).to.include('Features')
        expect(chunk).to.include('Bug Fixes')
        expect(chunk).to.include('Performance Improvements')
        expect(chunk).to.include('Reverts')
        expect(chunk).to.include('bad commit')
        expect(chunk).to.include('BREAKING CHANGE')

        expect(chunk).to.not.include('ci')
        expect(chunk).to.not.include('feat')
        expect(chunk).to.not.include('fix')
        expect(chunk).to.not.include('perf')
        expect(chunk).to.not.include('revert')
        expect(chunk).to.not.include('***:**')
        expect(chunk).to.not.include(': Not backward compatible.')

        done()
      }))
  })

  it('should replace #[0-9]+ with GitHub issue URL', function (done) {
    preparing(2)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()
        expect(chunk).to.include('[#133](https://github.com/conventional-changelog/conventional-changelog/issues/133)')
        done()
      }))
  })

  it('should remove the issues that already appear in the subject', function (done) {
    preparing(3)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()
        expect(chunk).to.include('[#88](https://github.com/conventional-changelog/conventional-changelog/issues/88)')
        expect(chunk).to.not.include('closes [#88](https://github.com/conventional-changelog/conventional-changelog/issues/88)')
        done()
      }))
  })

  it('should replace @username with GitHub user URL', function (done) {
    preparing(4)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()
        expect(chunk).to.include('[@bcoe](https://github.com/bcoe)')
        done()
      }))
  })

  it('should not discard commit if there is BREAKING CHANGE', function (done) {
    preparing(5)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.include('Continuous Integration')
        expect(chunk).to.include('Build System')
        expect(chunk).to.include('Documentation')
        expect(chunk).to.include('Styles')
        expect(chunk).to.include('Code Refactoring')
        expect(chunk).to.include('Tests')

        done()
      }))
  })

  it('should work if there is a semver tag', function (done) {
    preparing(6)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      outputUnreleased: true
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('some more features')
        expect(chunk).to.not.include('BREAKING')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should work with unknown host', function (done) {
    preparing(6)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: path.join(__dirname, 'fixtures/_unknown-host.json')
      }
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('(http://unknown/compare')
        expect(chunk).to.include('](http://unknown/commits/')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should work specifying where to find a package.json using conventional-changelog-core', function (done) {
    preparing(7)
    let i = 0

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: path.join(__dirname, 'fixtures/_known-host.json')
      }
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.com/conventional-changelog/example/compare')
        expect(chunk).to.include('](https://github.com/conventional-changelog/example/commit/')
        expect(chunk).to.include('](https://github.com/conventional-changelog/example/issues/')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should fallback to the closest package.json when not providing a location for a package.json', function (done) {
    preparing(7)
    let i = 0

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk, enc, cb) {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.com/conventional-changelog/conventional-changelog/compare')
        expect(chunk).to.include('](https://github.com/conventional-changelog/conventional-changelog/commit/')
        expect(chunk).to.include('](https://github.com/conventional-changelog/conventional-changelog/issues/')

        i++
        cb()
      }, function () {
        expect(i).to.equal(1)
        done()
      }))
  })

  it('should support non public GitHub repository locations', function (done) {
    preparing(7)

    conventionalChangelogCore({
      config: preset,
      pkg: {
        path: path.join(__dirname, 'fixtures/_ghe-host.json')
      }
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.include('(https://github.internal.example.com/dlmr')
        expect(chunk).to.include('(https://github.internal.example.com/conventional-changelog/internal/compare')
        expect(chunk).to.include('](https://github.internal.example.com/conventional-changelog/internal/commit/')
        expect(chunk).to.include('5](https://github.internal.example.com/conventional-changelog/internal/issues/5')
        expect(chunk).to.include(' closes [#10](https://github.internal.example.com/conventional-changelog/internal/issues/10)')

        done()
      }))
  })

  it('should only replace with link to user if it is an username', function (done) {
    preparing(8)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()

        expect(chunk).to.not.include('(https://github.com/5')
        expect(chunk).to.include('(https://github.com/username')

        expect(chunk).to.not.include('[@dummy](https://github.com/dummy)/package')
        expect(chunk).to.include('bump @dummy/package from')
        done()
      }))
  })

  it('parses both default (Revert "<subject>") and custom (revert: <subject>) revert commits', function (done) {
    preparing(9)

    conventionalChangelogCore({
      config: preset
    })
      .on('error', function (err) {
        done(err)
      })
      .pipe(through(function (chunk) {
        chunk = chunk.toString()
        expect(chunk).to.match(/custom revert format/)
        expect(chunk).to.match(/default revert format/)
        done()
      }))
  })
})
