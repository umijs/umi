const { execa } = require('@umijs/utils');
const { join } = require('path');
const getPackages = require('./utils/getPackages');

process.setMaxListeners(Infinity);

module.exports = function (publishPkgs) {
  const pkgs = (publishPkgs || getPackages()).map(
    (name) =>
      require(join(__dirname, '../packages', name, 'package.json')).name,
  );
  const commands = pkgs.map((pkg) => {
    const subprocess = execa('tnpm', ['sync', pkg]);
    subprocess.stdout.pipe(process.stdout);
    return subprocess;
  });
  Promise.all(commands);
};
