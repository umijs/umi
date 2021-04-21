import * as path from 'path';
import anymatch from 'anymatch';
import { IExpectOpts } from '../types';

export default ({ ignored }: IExpectOpts) => {
  expect(
    anymatch(ignored as any)(path.join(__dirname, 'bar', 'index.js')),
  ).toBeTruthy();
  expect(anymatch(ignored as any)(path.join(__dirname, 'bar'))).toBeFalsy();
  // issue: https://github.com/umijs/umi/issues/5416
  expect(
    anymatch(ignored as any)(path.join(__dirname, 'distributor', 'index.tsx')),
  ).toBeFalsy();
  expect(
    anymatch(ignored as any)(path.join(__dirname, 'distributor')),
  ).toBeFalsy();
  expect(
    anymatch(ignored as any)(path.join(__dirname, 'node_modules')),
  ).toBeTruthy();
};
