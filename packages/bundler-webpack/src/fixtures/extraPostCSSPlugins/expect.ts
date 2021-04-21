import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain('-webkit-overflow-scrolling: touch;');
};
