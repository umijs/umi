import { IExpectOpts } from '../types';

export default ({ indexContent }: IExpectOpts) => {
  expect(indexContent).toContain(`.b___`);
  expect(indexContent).toContain(`.a { color: red; }`);
}
