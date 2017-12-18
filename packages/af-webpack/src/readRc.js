import { readFileSync } from 'fs';

export default function(path) {
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}
