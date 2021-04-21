import { IExpectOpts } from '../types';

export default ({ indexJS, files }: IExpectOpts) => {
  expect(files).toEqual(['0.js', 'b.js', 'index.js']);
  expect(indexJS).toContain(`__webpack_require__.e(/*! import() */ 0)`);
  expect(indexJS).toContain(`__webpack_require__.e(/*! import() | b */ "b")`);
};
