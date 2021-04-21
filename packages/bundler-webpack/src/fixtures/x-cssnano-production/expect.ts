import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.a{color:red}.a{color:green;background:#00f}`);
};
