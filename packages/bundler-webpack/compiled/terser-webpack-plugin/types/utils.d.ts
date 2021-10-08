export type RawSourceMap = import('../source-map').RawSourceMap;
export type TerserFormatOptions = import('../../terser').FormatOptions;
export type TerserOptions = import('../../terser').MinifyOptions;
export type TerserECMA = import('../../terser').ECMA;
export type ExtractCommentsOptions =
  import('./index').ExtractCommentsOptions;
export type ExtractCommentsFunction =
  import('./index').ExtractCommentsFunction;
export type ExtractCommentsCondition =
  import('./index').ExtractCommentsCondition;
export type Input = import('./index').Input;
export type MinimizedResult = import('./index').MinimizedResult;
export type PredefinedOptions = import('./index').PredefinedOptions;
export type CustomOptions = {
  [key: string]: any;
};
export type ExtractedComments = Array<string>;
/** @typedef {import('../source-map').RawSourceMap} RawSourceMap */
/** @typedef {import('../../terser').FormatOptions} TerserFormatOptions */
/** @typedef {import('../../terser').MinifyOptions} TerserOptions */
/** @typedef {import('../../terser').ECMA} TerserECMA */
/** @typedef {import('./index').ExtractCommentsOptions} ExtractCommentsOptions */
/** @typedef {import('./index').ExtractCommentsFunction} ExtractCommentsFunction */
/** @typedef {import('./index').ExtractCommentsCondition} ExtractCommentsCondition */
/** @typedef {import('./index').Input} Input */
/** @typedef {import('./index').MinimizedResult} MinimizedResult */
/** @typedef {import('./index').PredefinedOptions} PredefinedOptions */
/**
 * @typedef {{ [key: string]: any }} CustomOptions
 */
/**
 * @typedef {Array<string>} ExtractedComments
 */
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & CustomOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */
export function terserMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & CustomOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinimizedResult>;
export namespace terserMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & CustomOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */
export function uglifyJsMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & CustomOptions,
  extractComments: ExtractCommentsOptions | undefined
): Promise<MinimizedResult>;
export namespace uglifyJsMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & CustomOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */
export function swcMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & CustomOptions
): Promise<MinimizedResult>;
export namespace swcMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & CustomOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */
export function esbuildMinify(
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minimizerOptions: PredefinedOptions & CustomOptions
): Promise<MinimizedResult>;
export namespace esbuildMinify {
  /**
   * @returns {string | undefined}
   */
  function getMinimizerVersion(): string | undefined;
}
