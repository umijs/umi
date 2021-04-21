import { IExpectOpts } from '../types';

export default ({ indexCSS }: IExpectOpts) => {
  expect(indexCSS).toContain(`.a { display: -ms-flexbox; display: flex; }`);
};
