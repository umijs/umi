import 'cheerio';
import IConfig, { IPlugin, IAFWebpackConfig, IRoute } from './config';
import * as IUi from './ui';
import { DefaultMethods } from 'signale';
import * as lodash from 'lodash';
import * as IWebpack from 'webpack';
import * as IWebpackChainConfig from 'webpack-chain';

/**
 * System level variable
 * https://umijs.org/plugin/develop.html#system-level-variable
 */
declare enum API_TYPE {
  ADD,
  MODIFY,
  EVENT,
}

// for multiStats, multiply webpack configs
export interface MultiStats {
  stats: IWebpack.Stats[];
  hash: string;
}
// for ui plugin developer
type IUiApi = IUi.IApi;

export { IConfig, IPlugin, IRoute, IWebpackChainConfig, IWebpack, IUi, IUiApi };

/**
 * System level API
 * https://umijs.org/plugin/develop.html#system-level-api
 */
export interface IRegisterPluginOpts {
  id: string;
  apply: any;
  opts?: object;
}

interface IRegisterPlugin {
  (plugin: IRegisterPluginOpts): void;
}

interface IRegister {
  (hook: string, handler: Function): void;
}

export interface IPluginMethodOpts {
  /**
   * @param args: Come from `applyPlugins(, { args: YOUR_ARGS })`
   */
  memo?: any;
  args?: any;
}

export interface IPluginMethod {
  /**
   * @param opts: Includes args passed in from `applyPlugins` and memo
   * @param args: Arguments passed in from other plug-ins when they call this method
   */
  (opts: IPluginMethodOpts, ...args: any[]): any;
}

export interface IRegisterMethodOpts {
  /**
   * Choose one of `type` and `apply`.
   * View more at https://umijs.org/plugin/develop.html#registermethod
   */
  type?: API_TYPE;
  apply?: IPluginMethod;
}

interface IRegisterMethod {
  (methodName: string, opts: IRegisterMethodOpts): void;
}

export interface IApplyPluginsOpts {
  args?: any;
  initialValue?: any;
}

interface IApplyPlugins {
  (methodName: string, opts?: IApplyPluginsOpts): any[] | undefined | any;
}

interface IReDo<T> {
  (message?: T): void;
}

interface IChangePluginOption {
  (pluginId: string, opts: any): void;
}

export interface ICommandOpts {
  /**
   * @param description: Description displayed when running `umi help`
   * @param details: Details displayed when running `umi help [YOUR_COMMAND]`
   * @param hide: Hide your command in `umi help`
   * @param options: Options displayed when running `umi help [YOUR_COMMAND]`
   * @param usage: Usage displayed when running `umi help [YOUR_COMMAND]`
   * @param webpack: Whether to initialize webpack config
   */
  description?: string;
  details?: string;
  hide?: boolean;
  options?: object;
  usage?: string;
  webpack?: boolean;
}

interface IRegisterCommand {
  (commandName: string, opts: ICommandOpts, fn: (args: any) => any): void;
  (commandName: string, fn: (args: any) => any): void;
}

export interface IRegisterConfigOpts<T = any> {
  /**
   * @param name: Name of your configuration
   * @param validate: Verify that the value of configuration is valid
   * @param onChange: Callback when the value of configuration changes
   */
  name: string;
  validate?: (value: T) => void;
  onChange?: (newConfig: IConfig, oldConfig: IConfig) => void;
}

export interface IRegisterConfigFunc {
  (api: IApi): IRegisterConfigOpts;
}

interface IRegisterConfig {
  (fn: IRegisterConfigFunc): void;
}

export interface IModifyCommandFuncOpts {
  name: string;
  args?: any;
}

export interface IModifyCommandFunc {
  (opts: IModifyCommandFuncOpts): IModifyCommandFuncOpts;
}

interface IModifyCommand {
  (fn: IModifyCommandFunc): void;
}

export interface IModifyHelpInfoOpts {
  scriptName: string;
  commands: {
    [commandName: string]: {
      opts: {
        hide: boolean;
        options: {
          [key: string]: string;
        };
      };
    };
  };
}

/**
 * Tool class API
 * https://umijs.org/plugin/develop.html#tool-class-api
 */
interface ILog<T = string> {
  (message: T, ...messages: string[]): void;
}

interface IWriteTmpFile {
  (file: string, content: string): void;
}

interface IGetRoutes {
  (): IRoute[];
}

interface IWinPath {
  (path: string): string;
}

type IRelativeToTmp = (path: string) => string;

interface IFind {
  (baseDir: string, fileNameWithoutExtname?: string): string | null;
}

interface ICompatDirname<T = any> {
  (path: string, cwd: string, fallback?: T): T | string;
}

/**
 * Event class API
 * https://umijs.org/plugin/develop.html#event-class-api
 */
export interface IBeforeDevServerFunc {
  (args: { server: any }): void;
}

export interface IAfterDevServerFunc {
  (
    args: {
      server: any;
      devServerPort: number;
    },
  ): void;
}

export interface IBeforeBlockWritingFunc {
  (
    args: {
      service: any;
      sourcePath: string;
      blockPath: string;
    },
  ): void;
}

interface IBeforeDevServer {
  (fn: IBeforeDevServerFunc): void;
}

interface IBeforeDevServerAsync {
  (fn: IBeforeDevServerFunc): Promise<any>;
}

interface IAfterDevServer {
  (fn: IAfterDevServerFunc): void;
}

interface IBeforeBlockWriting {
  (fn: IBeforeBlockWritingFunc): void;
}

interface IOnStart {
  (fn: () => void): void;
}

interface onPrintUmiError {
  (args: { error: any; opts: object }): void;
}

interface IEventAsync {
  (fn: () => void): Promise<any>;
}

export interface IOnDevCompileDoneFunc {
  (args: { isFirstCompile: boolean; stats: IWebpack.Stats }): void;
}

interface IOnDevCompileDone {
  (fn: IOnDevCompileDoneFunc): void;
}

export interface IOnOptionChangeFunc<T = any> {
  (newOpts: T): void;
}

interface IOnOptionChange {
  (fn: IOnOptionChangeFunc): void;
}

export interface IOnBuildSuccessFunc {
  (args: { stats: IWebpack.Stats[] }): void;
}

interface IOnBuildSuccess {
  (fn: IOnBuildSuccessFunc): void;
}

interface IOnBuildSuccessAsync {
  (fn: IOnBuildSuccessFunc): Promise<any>;
}

export interface IOnBuildFailFunc {
  (args: { stats: IWebpack.Stats[]; err: Error }): void;
}

interface IOnBuildFail {
  (fn: IOnBuildFailFunc): void;
}

interface IOnHTMLRebuild {
  (fn: () => void): void;
}

export interface IOnGenerateFilesFunc {
  (args: { isRebuild?: boolean }): void;
}

interface IOnGenerateFiles {
  (fn: IOnGenerateFilesFunc): void;
}

export interface IOnPatchRouteFunc {
  (args: { route: IRoute }): void;
}

interface IOnPatchRoute {
  (fn: IOnPatchRouteFunc): void;
}

interface IAction<T = object> {
  type: string;
  payload?: T;
  lang?: IUi.ILang;
}

export type ISend = (action: IAction<{}>) => void;
export type ISuccess<T = object> = (payload: T) => void;
export type IFailure<T = object> = (payload: T) => void;
type IUiLogType = 'error' | 'info';
export type IUiLog = (type: IUiLogType, payload: string) => void;

export interface IOnUISocketFunc {
  (
    args: {
      action: IAction;
      send: ISend;
      success: ISuccess<{}>;
      failure: IFailure<{}>;
      log: IUiLog;
    },
  ): void;
}

export interface IOnUISocket {
  (fn: IOnUISocketFunc): void;
}

export interface IChangeWebpackConfigFunc<T, U> {
  (webpackConfig: T, AFWebpack: { webpack: U }): T | void;
}

/**
 * Application class API
 * https://umijs.org/plugin/develop.html#application-class-api
 */
export interface IChangeWebpackConfig<T, U> {
  (fn: IChangeWebpackConfigFunc<T, U>): void;
}

export interface IModifyFunc<T, U> {
  /**
   * https://umijs.org/plugin/develop.html#registermethod
   */
  (memo: T, args: U): T | T;
}

export interface IModify<T, U = {}> {
  (fn: IModifyFunc<T, U> | T): void;
}

export interface IAddFunc<T, U> {
  /**
   * https://umijs.org/plugin/develop.html#registermethod
   */
  (memo: T[], args: U): T | T[];
}

export interface IAdd<T, U = {}> {
  (fn: IAddFunc<T, U> | T | T[]): void;
}

interface IGetChunkPath {
  (fileName: string): string | null;
}

interface IModifyHTMLWithASTArgs {
  route: IRoute;
  getChunkPath: IGetChunkPath;
}

export interface IModifyHTMLWithASTFunc {
  ($: CheerioStatic, args: IModifyHTMLWithASTArgs): void;
}

interface IModifyHTMLWithAST {
  (fn: IModifyHTMLWithASTFunc): void;
}

export interface IAddImportOpts {
  /**
   * @param source: Path to module
   * @param specifier: Module name with import, can be ignored
   */
  source: string;
  specifier?: string;
}

interface IModifyRouteComponentArgs {
  importPath: string;
  webpackChunkName: string;
  component: string;
}

export interface IPkg {
  name?: string;
  version?: string;
  dependencies?: {
    [prop: string]: string;
  };
  devDependencies?: {
    [prop: string]: string;
  };
}

interface IModifyBlockFileArgs {
  targetPath: string;
}

interface IModifyBlockTargetArgs {
  sourceName: string;
}

export interface IBlockDependencies {
  conflicts: [string, string, string][];
  lacks: [string, string][];
  devConflicts: [string, string, string][];
  devLacks: [string, string][];
}

export interface IMiddlewareFunction {
  (req: any, res: any, next: any): void;
}

export interface IApi {
  /**
   * System level variable
   * https://umijs.org/plugin/develop.html#system-level-variable
   */
  API_TYPE: typeof API_TYPE;
  config: IConfig;
  cwd: string;
  pkg: IPkg;
  webpackConfig: IWebpack.Configuration;
  service: any;
  locale: any;
  paths: {
    cwd: string;
    outputPath: string;
    absOutputPath: string;
    absNodeModulesPath: string;
    pagesPath: string;
    absPagesPath: string;
    absSrcPath: string;
    tmpDirPath: string;
    absTmpDirPath: string;
  };
  routes: IRoute[];

  /**
   * System level API
   * https://umijs.org/plugin/develop.html#system-level-api
   */
  register: IRegister;
  registerPlugin: IRegisterPlugin;
  registerMethod: IRegisterMethod;
  applyPlugins: IApplyPlugins;
  restart: IReDo<string>;
  rebuildTmpFiles: IReDo<string>;
  refreshBrowser: IReDo<void>;
  rebuildHTML: IReDo<void>;
  changePluginOption: IChangePluginOption;
  registerCommand: IRegisterCommand;
  _registerConfig: IRegisterConfig;
  _modifyCommand: IModifyCommand;
  _modifyHelpInfo: IModify<IModifyHelpInfoOpts>;

  /**
   * Tool class API
   * https://umijs.org/plugin/develop.html#tool-class-api
   */
  log: { [key in DefaultMethods]: ILog<any> };
  _: typeof lodash;
  winPath: IWinPath;
  relativeToTmp: IRelativeToTmp;
  debug: ILog;
  writeTmpFile: IWriteTmpFile;
  getRoutes: IGetRoutes;
  findJS: IFind;
  findCSS: IFind;
  compatDirname: ICompatDirname;
  UmiError: any;

  /**
   * Event class API
   * https://umijs.org/plugin/develop.html#event-class-api
   */
  beforeDevServer: IBeforeDevServer;
  _beforeDevServerAsync: IBeforeDevServerAsync;
  afterDevServer: IAfterDevServer;
  beforeBlockWriting: IBeforeBlockWriting;
  onStart: IOnStart;
  onPrintUmiError: onPrintUmiError;
  onStartAsync: IEventAsync;
  onDevCompileDone: IOnDevCompileDone;
  onOptionChange: IOnOptionChange;
  onBuildSuccess: IOnBuildSuccess;
  onBuildSuccessAsync: IOnBuildSuccessAsync;
  onBuildFail: IOnBuildFail;
  onHTMLRebuild: IOnHTMLRebuild;
  onGenerateFiles: IOnGenerateFiles;
  onPatchRoute: IOnPatchRoute;
  onUISocket: IOnUISocket;
  onRouteChange: (callback: () => void) => void;

  /**
   * Application class API
   * https://umijs.org/plugin/develop.html#application-class-api
   */
  modifyDefaultConfig: IModify<object>;
  addUmiExports: IAdd<object>;
  addPageWatcher: IAdd<string>;
  addHTMLMeta: IAdd<object, { route?: IRoute }>;
  addHTMLLink: IAdd<object, { route?: IRoute }>;
  addHTMLStyle: IAdd<object, { route?: IRoute }>;
  addHTMLScript: IAdd<object, { route?: IRoute }>;
  addHTMLHeadScript: IAdd<object, { route?: IRoute }>;
  modifyHTMLChunks: IModify<string[], { route?: IRoute }>;
  modifyHTMLWithAST: IModifyHTMLWithAST;
  modifyHTMLContext: IModify<object, { route?: IRoute }>;
  modifyPublicPathStr: IModify<string>;
  modifyRoutes: IModify<IRoute[]>;
  addEntryImportAhead: IAdd<IAddImportOpts>;
  addEntryPolyfillImports: IAdd<IAddImportOpts>;
  addEntryImport: IAdd<IAddImportOpts>;
  addEntryCodeAhead: IAdd<string>;
  addEntryCode: IAdd<string>;
  addUIPlugin: IAdd<string>;
  addRouterImport: IAdd<IAddImportOpts>;
  addRouterImportAhead: IAdd<IAddImportOpts>;
  addRendererWrapperWithComponent: IAdd<string, () => string>;
  addRendererWrapperWithModule: IAdd<string>;
  modifyEntryRender: IModify<string>;
  modifyEntryHistory: IModify<string>;
  modifyRouteComponent: IModify<string, IModifyRouteComponentArgs>;
  modifyRouterRootComponent: IModify<string>;
  modifyWebpackConfig: IModify<IWebpack.Configuration>;
  modifyAFWebpackOpts: IModify<IAFWebpackConfig>;
  chainWebpackConfig: IChangeWebpackConfig<IWebpackChainConfig, IAFWebpackConfig>;
  addMiddleware: IAdd<IMiddlewareFunction>;
  addMiddlewareAhead: IAdd<IMiddlewareFunction>;
  addMiddlewareBeforeMock: IAdd<IMiddlewareFunction>;
  addMiddlewareAfterMock: IAdd<IMiddlewareFunction>;
  addVersionInfo: IAdd<string>;
  addRuntimePlugin: IAdd<string>;
  addRuntimePluginKey: IAdd<string>;
  addBlockUIResource: IAdd<object>;
  modifyBlockUIResources: IModify<object[]>;
  _modifyBlockPackageJSONPath: IModify<string>;
  _modifyBlockDependencies: IModify<IBlockDependencies>;
  _modifyBlockFile: IModify<string, IModifyBlockFileArgs>;
  _modifyBlockTarget: IModify<string, IModifyBlockTargetArgs>;
  _modifyBlockNewRouteConfig: IModify<any>;
}
