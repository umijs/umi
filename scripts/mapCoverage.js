const { readdirSync, existsSync } = require('fs');
const { join } = require('path');
const istanbul = require('istanbul');
const collector = new istanbul.Collector();
const reporter = new istanbul.Reporter();

function getAllPaths() {
  const paths = [join(__dirname, '../coverage/coverage-final.json')];
  const collectionsDir = join(__dirname, '../node_modules/.collections');
  if (!existsSync(collectionsDir)) {
    return paths;
  }
  readdirSync(collectionsDir).forEach(file => {
    paths.push(join(collectionsDir, file));
  });
  return paths;
}

getAllPaths().forEach(filePath => {
  console.log(1111);
  console.log(filePath);
  const coverage = require(filePath); // eslint-disable-line
  collector.add(coverage);
});

reporter.addAll(['lcov']);
reporter.write(collector, false, () => {
  console.log('Generate done');
});
