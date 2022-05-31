import { IExpectOpts } from '../types';

export default ({ indexJS, files }: IExpectOpts) => {
  expect(files).toContain('index.js');
  expect(files).toContain('worker.worker.js');
  expect(indexJS).toContain(
    `compiled/worker-loader/runtime/inline.js"`,
  );
};
