import { IExpectOpts } from '../types';

export default ({ indexContent }: IExpectOpts) => {
  expect(indexContent).toContain(`JSON.parse("{\\"foo\\":\\"react\\"}");`);
}
