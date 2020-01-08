import { IExpectOpts } from '../types';

export default ({ indexContent }: IExpectOpts) => {
  expect(indexContent).toContain(`console.log(a)`);
}
