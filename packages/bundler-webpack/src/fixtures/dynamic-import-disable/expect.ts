import { IExpectOpts } from '../types';

export default ({ indexJS, files }: IExpectOpts) => {
  expect(indexJS).toContain(`console.log('a');`);
  expect(indexJS).toContain(`console.log('b');`);
};
