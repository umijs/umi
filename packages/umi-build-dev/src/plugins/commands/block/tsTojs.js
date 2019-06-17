import sylvanas from 'sylvanas';
import glob from 'glob';

function globList(patternList, options) {
  let fileList = [];
  patternList.forEach(pattern => {
    fileList = [...fileList, ...glob.sync(pattern, options)];
  });

  return fileList;
}
export default cwd => {
  const tsFiles = globList(['**/*.tsx', '**/*.ts'], {
    cwd,
    ignore: ['**/*.d.ts'],
  });
  return sylvanas(tsFiles, {
    cwd,
    action: 'overwrite',
  });
};
