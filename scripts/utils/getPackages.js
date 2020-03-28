const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = function getPackages() {
  return readdirSync(join(__dirname, '../../packages')).filter(
    (pkg) => pkg.charAt(0) !== '.',
  );
};
