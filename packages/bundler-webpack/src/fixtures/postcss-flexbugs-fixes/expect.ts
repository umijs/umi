import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  console.log('indexCSS', indexCSS)
  expect(indexCSS).toContain(`.foo { flex: 1 1; }`);
}
