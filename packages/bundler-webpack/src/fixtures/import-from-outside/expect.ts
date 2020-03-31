import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(`(_a$b = a.b) === null || _a$b === void 0 ? void 0 : _a$b.c`);
}