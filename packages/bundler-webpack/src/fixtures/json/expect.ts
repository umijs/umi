import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(`JSON.parse("{\\"foo\\":\\"react\\"}");`);
};
