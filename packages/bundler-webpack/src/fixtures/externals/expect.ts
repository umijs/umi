import { IExpectOpts } from '../types';

export default ({ indexContent }: IExpectOpts) => {
  expect(indexContent).toContain(`module.exports = React;`);
}
