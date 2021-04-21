import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(`console.log(a)`);
};
