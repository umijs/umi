const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const filePath = join(__dirname, '../bundled/js/webpackHotDevClient.js');
const content = readFileSync(filePath, 'utf-8');
writeFileSync(
  filePath,
  content.replace(
    'true && console.warn("react-error-overlay',
    'process.env.NODE_ENV === "production" && console.warn("react-error-overlay',
  ),
  'utf-8',
);
console.log('patch webpackHotDevClient.js done');
