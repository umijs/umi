'use strict';

const mock = require('egg-mock');

describe('test/app/controller/home.test.js', () => {
  let app;
  before(() => {
    mock.env('local');
    app = mock.app();
    return app.ready();
  });
  after(() => app.close());

  afterEach(mock.restore);

  it('should GET /', async function() {
    return app
      .httpRequest()
      .get('/')
      .expect(/http:\/\/127.0.0.1:8000\/umi.js/)
      .expect(200);
  });
});
