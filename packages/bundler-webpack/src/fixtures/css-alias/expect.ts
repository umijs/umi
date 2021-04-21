import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.foo {`);
  expect(indexCSS).toContain(`.bar {`);
  expect(indexCSS).toContain(`.b {`);
};
