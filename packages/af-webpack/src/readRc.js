import { readFileSync } from 'fs';
import stripJsonComments from 'strip-json-comments';

export default function(path) {
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(stripJsonComments(content));
}
