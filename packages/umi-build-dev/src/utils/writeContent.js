import { readFileSync, writeFileSync, existsSync } from 'fs';

export default (path, content) => {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) {
    return;
  }
  writeFileSync(path, content, 'utf8');
};
