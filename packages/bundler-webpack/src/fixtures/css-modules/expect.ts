import { IExpectOpts } from '../types';

export default ({ indexCSS, indexJS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.b___`);
  expect(indexCSS).toContain(`.a { color: red; }`);
  expect(indexJS).toMatch(/__webpack_require__\.n\(_empty_less_modules.+\)/i);
}
