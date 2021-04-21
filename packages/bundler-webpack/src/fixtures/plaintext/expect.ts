import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(`# foo`);
  expect(indexJS).toContain(`# bar`);
};
