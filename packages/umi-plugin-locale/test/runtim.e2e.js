const { join } = require('path');

require('test-umi-plugin')({
  fixtures: join(__dirname, '../examples/'),
});
