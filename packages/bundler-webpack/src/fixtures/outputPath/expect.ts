import * as path from 'path';
import { IExpectOpts } from '../types';

export default ({ ignored }: IExpectOpts) => {
  expect(ignored?.test(path.join(__dirname, 'bar', 'index.js'))).toBeTruthy();
  // issue: https://github.com/umijs/umi/issues/5416
  expect(ignored?.test(path.join(__dirname, 'distributor', 'index.tsx'))).toBeFalsy();
  expect(ignored?.test(path.join(__dirname, 'node_modules'))).toBeTruthy();
}
