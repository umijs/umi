import { IExpectOpts } from '../types';

export default ({ indexJS, files }: IExpectOpts) => {
  expect(files).toContain('index.js');
  expect(files).toContain('worker.worker.js');
  expect(indexJS).toContain(
    `return new Worker(__webpack_require__.p + "worker.worker.js");`,
  );
};
