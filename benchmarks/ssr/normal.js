const { Stream } = require('stream');

module.exports = (suite) => {
  const render = require('./fixtures/normal/dist/umi.server');

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
          stream: true,
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
