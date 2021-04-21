import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  // transform
  // in exclude
  expect(indexJS).toContain(`var reactIntl = 'reactIntl';`);
  // in es5-imcompatible-versions
  expect(indexJS).toContain(`var camelcase = 'camelcase';`);

  // not transform
  expect(indexJS).toContain(`const react = 'react';`);
  expect(indexJS).toContain(`const foo = 'foo';`);
};
