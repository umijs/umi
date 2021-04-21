import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.b___`);
  expect(indexCSS).toContain(`color: #333;`);
  expect(indexCSS).toContain(`.a {`);
  expect(indexCSS).toContain('.c___');
  expect(indexCSS).toContain(`-webkit-box-orient: vertical;`);
};
