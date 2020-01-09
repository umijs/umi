import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.foo { flex: 1 1; }`);
}
