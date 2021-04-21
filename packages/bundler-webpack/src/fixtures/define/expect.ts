import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(`console.log("1");`);
  expect(indexJS).toContain(`console.log("2");`);
  expect(indexJS).toContain(`console.log("3");`);
  expect(indexJS).toContain(`console.log("test");`);
};
