const { readdirSync } = require('fs');

module.exports = function getPackages() {
  return readdirSync(join(__dirname, '../../packages')).filter(
    pkg => pkg.charAt(0) !== '.',
  );
};
