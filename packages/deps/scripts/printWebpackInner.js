
const innerFiles = require('../bundles/webpack/innerFiles');

console.log('bundle4');
const bundle4Map = innerFiles.getBundle4Map();
Object.keys(bundle4Map).forEach((key) => {
  console.log(`${key}: ${bundle4Map[key]},`);
});

console.log();
console.log('bundle5');
const bundle5Map = innerFiles.getBundle5Map();
Object.keys(bundle5Map).forEach((key) => {
  console.log(`${key}: ${bundle5Map[key]},`);
});

console.log();
innerFiles.generatePackageFiles();

