const lessToJs = require('less-vars-to-js');
// const { blue, red, gold } = require('@ant-design/colors');
const fs = require('fs');
const path = require('path');

const paletteLess = fs.readFileSync(path.resolve(__dirname, 'parameters.less'), 'utf8');

const palette = lessToJs(paletteLess, {
  resolveVariables: true,
  stripPrefix: true,
});

module.exports = {
  ...palette,
};
