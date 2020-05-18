const { Stream } = require('stream');

module.exports = (suite) => {
  const render = require('./dist/umi.server.js');

  // add tests
  suite
    .add('ssr#normal /', {
      defer: true,
      fn: (deferred) => {
        render({
          path: '/',
        }).then((res) => {
          if (res.html) {
            deferred.resolve();
          } else {
            suite.abort();
          }
        });
      },
    })
    .add('ssr#normal#stream /', {
      defer: true,
      fn: (deferred) => {
        render({
          path: '/',
          mode: 'stream',
        }).then((res) => {
          if (res.html instanceof Stream) {
            deferred.resolve();
          } else {
            suite.abort();
          }
        });
      },
    });
};
