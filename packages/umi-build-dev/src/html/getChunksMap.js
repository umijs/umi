import { extname } from 'path';

export default function(chunks = {}) {
  return Object.keys(chunks).reduce((memo, key) => {
    chunks[key].forEach(file => {
      memo[`${key}${extname(file)}`] = file;
    });
    return memo;
  }, {});
}
