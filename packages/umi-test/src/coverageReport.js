import { join } from 'path';
import mkdirp from 'mkdirp';
import { writeFileSync } from 'fs';
import * as uuid from 'uuid';

const getCollectionDir = targetDir => {
  // 获取输出的路径
  const collectionDir = join(targetDir, '.collections');
  mkdirp.sync(targetDir);
  mkdirp.sync(collectionDir);
  return collectionDir;
};

export default function coverageReport({ targetDir, fileName }) {
  if (!process.env.COVERAGE) {
    return;
  }
  process.on('exit', () => {
    const coverageData = global.__coverage__;
    if (!coverageData) {
      return;
    }
    const collectionDir = getCollectionDir(targetDir);
    writeFileSync(
      join(collectionDir, `${fileName}-${uuid.v1()}.json`),
      JSON.stringify(coverageData),
      'utf8',
    );
  });
}
