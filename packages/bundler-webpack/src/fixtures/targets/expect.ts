import { IExpectOpts } from '../types';

export default ({ indexJS }: IExpectOpts) => {
  expect(indexJS).toContain(
    `babel_runtime_helpers_esm_classCallCheck_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this, A);`,
  );
};
