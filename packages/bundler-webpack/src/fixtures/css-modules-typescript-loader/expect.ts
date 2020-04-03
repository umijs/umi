import { IExpectOpts } from '../types';

export default ({ indexCSS, files }: IExpectOpts) => {
  expect(indexCSS).toContain(`.a___`);
  expect(indexCSS).toContain(`.test___`);
}
