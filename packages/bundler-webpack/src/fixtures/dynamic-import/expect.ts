import { IExpectOpts } from '../types';

export default ({ indexContent, files }: IExpectOpts) => {
  expect(files).toEqual(['0.js', 'b.js', 'index.js']);
  expect(indexContent).toContain(`__webpack_require__.e(/*! import() */ 0)`);
  expect(indexContent).toContain(`__webpack_require__.e(/*! import() | b */ "b")`);
}
