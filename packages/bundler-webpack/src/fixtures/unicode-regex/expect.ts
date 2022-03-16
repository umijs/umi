import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  // no unicode regex
  expect(indexJS).not.toContain(`/u);`);
  expect(indexJS).not.toContain(`/ug);`);
};
