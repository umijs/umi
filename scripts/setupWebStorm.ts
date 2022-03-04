import { join } from 'path';
import { eachPkg, getPkgs, setExcludeFolder } from './utils';

const cwd = process.cwd();
eachPkg(getPkgs(), ({ name }) => {
  setExcludeFolder({ pkg: name, cwd });
});

eachPkg(
  getPkgs({ base: join(__dirname, '../examples') }),
  ({ name }) => {
    setExcludeFolder({
      pkg: name,
      cwd,
      dirName: 'examples',
      folders: ['.mfsu', '.umi'],
    });
  },
  {
    base: join(__dirname, '../examples'),
  },
);
