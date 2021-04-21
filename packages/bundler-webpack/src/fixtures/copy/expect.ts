import { IExpectOpts } from '../types';

export default ({ files }: IExpectOpts) => {
  expect(files).toContain(`a.ts`);
  expect(files).toContain(`b.ts`);
  expect(files).toContain(`index.js`);
  expect(files).toContain(`c.ts`);
  expect(files).toContain(`d.ts`);
};
