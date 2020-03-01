import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.b___`);
  expect(indexCSS).toContain(`.a { color: red; }`);
}
