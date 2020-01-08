import { IExpectOpts } from '../types';

export default ({ indexContent }: IExpectOpts) => {
  expect(indexContent).toContain(`React.createElement("div", null, "111")`);
}
