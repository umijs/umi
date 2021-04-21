import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  // not exclude
  expect(indexJS).toContain(`var reactIntl = 'reactIntl';`);
  // exclude
  expect(indexJS).toContain(`const react = 'react';`);
  expect(indexJS).toContain(`const foo = 'foo';`);
};
