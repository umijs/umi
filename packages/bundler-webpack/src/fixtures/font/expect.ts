import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`src: url(./static/a.`);
  expect(indexCSS).toContain(`.eot);`);
}
