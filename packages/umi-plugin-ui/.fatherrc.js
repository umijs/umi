const { readdirSync } = require('fs');
const { join } = require('path');

const localeFiles = readdirSync(join(__dirname, 'src/bubble/bubble-locale'))
  .filter(f => f.charAt(0) !== '.')
  .map(f => `src/bubble/bubble-locale/${f}`);

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  browserFiles: ['src/bubble/socket.js', 'src/bubble/utils.js', ...localeFiles],
  disableTypeCheck: true,
};
