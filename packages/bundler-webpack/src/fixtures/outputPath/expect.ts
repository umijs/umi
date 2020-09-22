import * as path from 'path';
import { IExpectOpts } from '../types';

export default ({ ignored }: IExpectOpts) => {
  expect(ignored?.test(path.join(__dirname, 'bar', 'index.js'))).toBeTruthy();
  expect(ignored?.test(path.join(__dirname, 'node_modules'))).toBeTruthy();
}
