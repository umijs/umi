const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = function getPackages(path = '../../packages') {
  return readdirSync(join(__dirname, path)).filter(
    (pkg) => pkg.charAt(0) !== '.',
  );
};
