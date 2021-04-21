import { join } from 'path';
import { readFileSync } from 'fs';
import { IExpectOpts } from '../types';

export default ({ files, cwd }: IExpectOpts) => {
  expect(files).toContain(`asset-manifest.json`);
  expect(
    readFileSync(join(cwd, 'dist/asset-manifest.json'), 'utf-8'),
  ).toContain(`"index.js": "/foo/index.js"`);
};
