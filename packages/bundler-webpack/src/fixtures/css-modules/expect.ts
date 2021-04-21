import { IExpectOpts } from '../types';

export default ({ indexCSS, indexCSSMap, indexJS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.b___`);
  expect(indexCSS).toContain(`.a { color: red; }`);
  expect(indexCSSMap).toContain('css-modules/a.css');
  expect(indexCSSMap).toContain('css-modules/b.css');

  expect(indexJS).toMatch(/__webpack_require__\.n\(_empty_less_modules.+\)/i);
};
