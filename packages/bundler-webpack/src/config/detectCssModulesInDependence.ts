import { Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { chalk, lodash, resolve } from '@umijs/utils';
import { dirname, isAbsolute } from 'path';
import { IConfig } from '../types';

interface IOpts {
  userConfig: IConfig;
  config: Config;
  cwd: string;
  extraBabelIncludes: Array<string | RegExp>;
}

export async function addDependenceCssModulesDetector(opts: IOpts) {
  const { config, cwd, userConfig } = opts;

  if (!userConfig.checkDepCssModules) return;

  const matchers = opts.extraBabelIncludes.map(function (p): RegExp {
    if (lodash.isRegExp(p)) {
      return p;
    }

    let absPath;
    if (isAbsolute(p)) {
      absPath = p;
    }

    try {
      if (p.startsWith('./')) {
        absPath = require.resolve(p, { paths: [cwd] });
      }
      // use resolve instead of require.resolve
      // since require.resolve may meet the ERR_PACKAGE_PATH_NOT_EXPORTED error
      absPath = dirname(
        resolve.sync(`${p}/package.json`, {
          basedir: cwd,
          // same behavior as webpack, to ensure `include` paths matched
          // ref: https://webpack.js.org/configuration/resolve/#resolvesymlinks
          preserveSymlinks: false,
        }),
      );

      return toRegExp(absPath);
    } catch (e: any) {
      if (e.code === 'MODULE_NOT_FOUND') {
        throw new Error('Cannot resolve extraBabelIncludes: ' + p, {
          cause: e,
        });
      }
      throw e;
    }
  });

  config
    .plugin('dep-css-modules-detector')
    .use(DetectCSsModulePlugin, [matchers]);
}

class DetectCSsModulePlugin {
  static PLUGIN_NAME = 'depCssModulesDetector';
  static ERROR_NAME = 'USE CSS-MODULES IN NODE_MODULES';

  constructor(readonly skipMatcher: Array<RegExp> = []) {}

  private isCallRequireStyle(statement: any): boolean {
    if (
      // var x= require(...) ?
      statement.type === 'CallExpression' &&
      statement.callee.type === 'Identifier' &&
      statement.callee.name === 'require' &&
      // var x = require('xxxxx')
      statement.arguments.length === 1 &&
      statement.arguments[0].type === 'Literal'
    ) {
      const requireArg: string = statement.arguments[0].value;
      // var x = require('xxx.less') or require('xxx.css')
      if (requireArg.endsWith('.less') || requireArg.endsWith('.css')) {
        return true;
      }
    }
    return false;
  }

  apply(compiler: Compiler) {
    compiler.hooks.normalModuleFactory.tap(
      DetectCSsModulePlugin.PLUGIN_NAME,
      (factory: any) => {
        factory.hooks.parser
          .for('javascript/auto')
          .tap('lessDetector', (parser: any) => {
            parser.hooks.import.tap(
              'lessDetector',
              (statement: any, source: string) => {
                const specifiers = statement.specifiers.length;
                if (
                  specifiers > 0 &&
                  (source.endsWith('.less') || source.endsWith('.css')) &&
                  this.isJSModule(parser)
                ) {
                  this.throwError(parser.state?.module?.resource, compiler);
                }
              },
            );

            parser.hooks.program.tap(
              DetectCSsModulePlugin.PLUGIN_NAME,
              (program: any) => {
                if (this.isJSModule(parser)) {
                  for (const statement of program.body) {
                    // x = ... ?
                    if (
                      statement.type === 'AssignmentExpression' &&
                      // x= require("x.less") or var x = require(".css") ?
                      this.isCallRequireStyle(statement.right)
                    ) {
                      this.throwError(parser.state?.module?.resource, compiler);
                    }

                    if (
                      statement.type === 'VariableDeclarator' &&
                      // var x= require("x.less") or var x = require(".css") ?
                      this.isCallRequireStyle(statement.init)
                    ) {
                      this.throwError(parser.state?.module?.resource, compiler);
                    }
                  }
                }
              },
            );
          });
      },
    );
  }

  private isJSModule(parser: any): boolean {
    let res = parser.state?.module?.resource;
    if (res) {
      if (this.skipMatcher.some((r) => r.test(res))) {
        return false;
      }

      return (
        res.indexOf('node_modules') >= 0 &&
        (res.endsWith('.js') || res.endsWith('.jsx'))
      );
    }
    return false;
  }

  private throwError(file: string, c: Compiler) {
    const logger =
      c.getInfrastructureLogger(DetectCSsModulePlugin.PLUGIN_NAME) || console;

    logger.error(chalk.red(`Dependence file ${file} contains css module`));
    logger.error(
      chalk.red(
        `Please add the package's name in 'babelExtraIncludes' or use non-css module in dependence`,
      ),
    );

    throw Error(DetectCSsModulePlugin.ERROR_NAME);
  }
}

const toRegExp = (test: string | RegExp) => {
  if (typeof test === 'string') {
    return new RegExp('^' + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
  }
  return test;
};
