import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain('var bar = 1;');
  expect(indexJS).toContain('var foo = 1;');
  expect(indexJS).toContain('var hoo = 1;');
}
