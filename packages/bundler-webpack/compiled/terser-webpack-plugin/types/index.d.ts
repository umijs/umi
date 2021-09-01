export default TerserPlugin;
export type Schema = import('../schema-utils/declarations/validate').Schema;
export type Compiler = import('../../webpack').Compiler;
export type Compilation = import('../../webpack').Compilation;
export type WebpackError = import('../../webpack').WebpackError;
export type Asset = import('../../webpack').Asset;
export type TerserECMA = import('../../terser').ECMA;
export type TerserOptions = import('../../terser').MinifyOptions;
export type UglifyJSOptions = import('../../uglify-js').MinifyOptions;
export type SwcOptions = import('../../../@swc/core').JsMinifyOptions;
export type EsbuildOptions = import('../../esbuild').TransformOptions;
export type CustomOptions = any;
export type JestWorker = import('../jest-worker').Worker;
export type RawSourceMap = import('../source-map').RawSourceMap;
export type Rule = RegExp | string;
export type Rules = Rule[] | Rule;
export type ExtractCommentsFunction = (
  astNode: any,
  comment: {
    value: string;
    type: "comment1" | "comment2" | "comment3" | "comment4";
    pos: number;
    line: number;
    col: number;
  }
) => boolean;
export type ExtractCommentsCondition =
  | boolean
  | "all"
  | "some"
  | RegExp
  | ExtractCommentsFunction;
export type ExtractCommentsFilename = string | ((fileData: any) => string);
export type ExtractCommentsBanner =
  | string
  | boolean
  | ((commentsFile: string) => string);
export type ExtractCommentsObject = {
  condition: ExtractCommentsCondition;
  filename: ExtractCommentsFilename;
  banner: ExtractCommentsBanner;
};
export type ExtractCommentsOptions =
  | ExtractCommentsCondition
  | ExtractCommentsObject;
export type Input = {
  [file: string]: string;
};
export type MinimizedResult = {
  code: string;
  map?: import('../source-map').RawSourceMap | undefined;
  errors?: (string | Error)[] | undefined;
  warnings?: (string | Error)[] | undefined;
  extractedComments?: string[] | undefined;
};
export type PredefinedOptions = {
  module?: boolean | undefined;
  ecma?: string | number | undefined;
};
export type MinimizerImplementationAndOptions<T> = {
  implementation: MinimizerImplementation<ThirdArgument<T>>;
  options: PredefinedOptions & ThirdArgument<T>;
};
export type InternalOptions<T> = {
  name: string;
  input: string;
  inputSourceMap: RawSourceMap | undefined;
  extractComments: ExtractCommentsOptions | undefined;
  minimizer: MinimizerImplementationAndOptions<T>;
};
export type MinimizerWorker<T> = Worker & {
  transform: (options: string) => MinimizedResult;
  minify: (options: InternalOptions<T>) => MinimizedResult;
};
export type BasicMinimizerImplementation<T> = (
  input: Input,
  sourceMap: RawSourceMap | undefined,
  minifyOptions: T,
  extractComments: ExtractCommentsOptions | undefined
) => Promise<MinimizedResult>;
export type MinimizeFunctionHelpers = {
  getMinimizerVersion?: (() => string | undefined) | undefined;
};
export type MinimizerImplementation<T> = BasicMinimizerImplementation<T> &
  MinimizeFunctionHelpers;
export type TerserMinimizer = MinimizerImplementation<TerserOptions>;
export type UglifyJSMinimizer = MinimizerImplementation<UglifyJSOptions>;
export type SwcMinimizer = MinimizerImplementation<SwcOptions>;
export type EsbuildMinimizer = MinimizerImplementation<EsbuildOptions>;
export type CustomMinimizer = MinimizerImplementation<CustomOptions>;
export type BasePluginOptions = {
  test?: Rules | undefined;
  include?: Rules | undefined;
  exclude?: Rules | undefined;
  extractComments?: ExtractCommentsOptions | undefined;
  parallel?: boolean | undefined;
};
export type ThirdArgument<T> = T extends (
  arg1: any,
  arg2: any,
  arg3: infer U,
  ...args: any[]
) => any
  ? U
  : never;
export type DefaultMinimizerImplementationAndOptions<T> = {
  minify?: undefined | MinimizerImplementation<ThirdArgument<T>>;
  terserOptions?: ThirdArgument<T> | undefined;
};
export type PickMinimizerImplementationAndOptions<T> =
  T extends MinimizerImplementation<TerserOptions>
    ? DefaultMinimizerImplementationAndOptions<T>
    : {
        minify: MinimizerImplementation<ThirdArgument<T>>;
        terserOptions?: ThirdArgument<T> | undefined;
      };
/** @typedef {import('../schema-utils/declarations/validate').Schema} Schema */
/** @typedef {import('../../webpack').Compiler} Compiler */
/** @typedef {import('../../webpack').Compilation} Compilation */
/** @typedef {import('../../webpack').WebpackError} WebpackError */
/** @typedef {import('../../webpack').Asset} Asset */
/** @typedef {import('../../terser').ECMA} TerserECMA */
/** @typedef {import('../../terser').MinifyOptions} TerserOptions */
/** @typedef {import('../../uglify-js').MinifyOptions} UglifyJSOptions */
/** @typedef {import('../../../@swc/core').JsMinifyOptions} SwcOptions */
/** @typedef {import('../../esbuild').TransformOptions} EsbuildOptions */
/** @typedef {Object.<any, any>} CustomOptions */
/** @typedef {import('../jest-worker').Worker} JestWorker */
/** @typedef {import('../source-map').RawSourceMap} RawSourceMap */
/** @typedef {RegExp | string} Rule */
/** @typedef {Rule[] | Rule} Rules */
/**
 * @callback ExtractCommentsFunction
 * @param {any} astNode
 * @param {{ value: string, type: 'comment1' | 'comment2' | 'comment3' | 'comment4', pos: number, line: number, col: number }} comment
 * @returns {boolean}
 */
/**
 * @typedef {boolean | 'all' | 'some' | RegExp | ExtractCommentsFunction} ExtractCommentsCondition
 */
/**
 * @typedef {string | ((fileData: any) => string)} ExtractCommentsFilename
 */
/**
 * @typedef {boolean | string | ((commentsFile: string) => string)} ExtractCommentsBanner
 */
/**
 * @typedef {Object} ExtractCommentsObject
 * @property {ExtractCommentsCondition} condition
 * @property {ExtractCommentsFilename} filename
 * @property {ExtractCommentsBanner} banner
 */
/**
 * @typedef {ExtractCommentsCondition | ExtractCommentsObject} ExtractCommentsOptions
 */
/**
 * @typedef {{ [file: string]: string }} Input
 */
/**
 * @typedef {Object} MinimizedResult
 * @property {string} code
 * @property {RawSourceMap} [map]
 * @property {Array<Error | string>} [errors]
 * @property {Array<Error | string>} [warnings]
 * @property {Array<string>} [extractedComments]
 */
/**
 * @typedef {Object} PredefinedOptions
 * @property {boolean} [module]
 * @property {5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | number | string} [ecma]
 */
/**
 * @template T
 * @typedef {Object} MinimizerImplementationAndOptions
 * @property {MinimizerImplementation<ThirdArgument<T>>} implementation
 * @property {PredefinedOptions & ThirdArgument<T>} options
 */
/**
 * @template T
 * @typedef {Object} InternalOptions
 * @property {string} name
 * @property {string} input
 * @property {RawSourceMap | undefined} inputSourceMap
 * @property {ExtractCommentsOptions | undefined} extractComments
 * @property {MinimizerImplementationAndOptions<T>} minimizer
 */
/**
 * @template T
 * @typedef {JestWorker & { transform: (options: string) => MinimizedResult, minify: (options: InternalOptions<T>) => MinimizedResult }} MinimizerWorker
 */
/**
 * @template T
 * @callback BasicMinimizerImplementation
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {T} minifyOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @returns {Promise<MinimizedResult>}
 */
/**
 * @typedef {object} MinimizeFunctionHelpers
 * @property {() => string | undefined} [getMinimizerVersion]
 */
/**
 * @template T
 * @typedef {BasicMinimizerImplementation<T> & MinimizeFunctionHelpers } MinimizerImplementation
 */
/**
 * @typedef {MinimizerImplementation<TerserOptions>} TerserMinimizer
 */
/**
 * @typedef {MinimizerImplementation<UglifyJSOptions>} UglifyJSMinimizer
 */
/**
 * @typedef {MinimizerImplementation<SwcOptions>} SwcMinimizer
 */
/**
 * @typedef {MinimizerImplementation<EsbuildOptions>} EsbuildMinimizer
 */
/**
 * @typedef {MinimizerImplementation<CustomOptions>} CustomMinimizer
 */
/**
 * @typedef {Object} BasePluginOptions
 * @property {Rules} [test]
 * @property {Rules} [include]
 * @property {Rules} [exclude]
 * @property {ExtractCommentsOptions} [extractComments]
 * @property {boolean} [parallel]
 */
/**
 * @template T
 * @typedef {T extends (arg1: any, arg2: any, arg3: infer U, ...args: any[]) => any ? U: never} ThirdArgument
 */
/**
 * @template T
 * @typedef {Object} DefaultMinimizerImplementationAndOptions
 * @property {undefined | MinimizerImplementation<ThirdArgument<T>>} [minify]
 * @property {ThirdArgument<T> | undefined} [terserOptions]
 */
/**
 * @template T
 * @typedef {T extends MinimizerImplementation<TerserOptions> ? DefaultMinimizerImplementationAndOptions<T> : { minify: MinimizerImplementation<ThirdArgument<T>>, terserOptions?: ThirdArgument<T> | undefined}} PickMinimizerImplementationAndOptions
 */
/**
 * @template {TerserMinimizer | UglifyJSMinimizer | SwcMinimizer | EsbuildMinimizer | CustomMinimizer} T=TerserMinimizer
 */
declare class TerserPlugin<
  T extends
    | TerserMinimizer
    | UglifyJSMinimizer
    | SwcMinimizer
    | EsbuildMinimizer
    | CustomMinimizer
> {
  /**
   * @private
   * @param {any} input
   * @returns {boolean}
   */
  private static isSourceMap;
  /**
   * @private
   * @param {Error | string} warning
   * @param {string} file
   * @returns {WebpackError}
   */
  private static buildWarning;
  /**
   * @private
   * @param {any} error
   * @param {string} file
   * @param {Compilation["requestShortener"]} [requestShortener]
   * @param {SourceMapConsumer} [sourceMap]
   * @returns {WebpackError}
   */
  private static buildError;
  /**
   * @private
   * @param {boolean | undefined} parallel
   * @returns {number}
   */
  private static getAvailableNumberOfCores;
  /**
   * @private
   * @param {any} environment
   * @returns {TerserECMA}
   */
  private static getEcmaVersion;
  /**
   * @param {BasePluginOptions & PickMinimizerImplementationAndOptions<T>} [options]
   */
  constructor(
    options?:
      | (BasePluginOptions & PickMinimizerImplementationAndOptions<T>)
      | undefined
  );
  /**
   * @type {BasePluginOptions & { minify: MinimizerImplementation<ThirdArgument<T>>, terserOptions: ThirdArgument<T>}}
   */
  options: BasePluginOptions & {
    minify: MinimizerImplementation<ThirdArgument<T>>;
    terserOptions: ThirdArgument<T>;
  };
  /**
   * @private
   * @param {Compiler} compiler
   * @param {Compilation} compilation
   * @param {Record<string, import('../../webpack').sources.Source>} assets
   * @param {{availableNumberOfCores: number}} optimizeOptions
   * @returns {Promise<void>}
   */
  private optimize;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace TerserPlugin {
  export { terserMinify };
  export { uglifyJsMinify };
  export { swcMinify };
  export { esbuildMinify };
}
import { Worker } from '../jest-worker';
import { terserMinify } from './utils';
import { uglifyJsMinify } from './utils';
import { swcMinify } from './utils';
import { esbuildMinify } from './utils';
