import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.foo { flex: 1 1; }`);
  // media
  expect(indexCSS).toContain(
    `@media screen and (min-width: 500px) and (max-width: 1200px) {`,
  );
  expect(indexCSS).toContain(
    `@media screen and (min-width: 600px) and (max-width: 1000px) {`,
  );
  // grid
  expect(indexCSS).toContain(`grid-gap: 20px;`);
  expect(indexCSS).toContain(`gap: 20px;`);
  expect(indexCSS).toContain(`grid-column-gap: 40px;`);
  expect(indexCSS).toContain(`column-gap: 40px;`);
  expect(indexCSS).toContain(`grid-row-gap: 20px;`);
  expect(indexCSS).toContain(`row-gap: 20px;`);
  // font-varian
  expect(indexCSS).toContain(`font-feature-settings: "smcp";`);
  expect(indexCSS).toContain(`font-variant-caps: small-caps;`);
  expect(indexCSS).toContain(`font-feature-settings: "lnum";`);
  expect(indexCSS).toContain(`font-variant-numeric: lining-nums;`);
};
