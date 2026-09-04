import type {
  Compilation,
  Compiler,
  NormalModule,
} from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';

interface IOpts {
  config: Config;
}

// ref: https://github.com/webpack/webpack/blob/ccecc17c01af96edddb931a76e7a3b21ef2969d8/lib/dependencies/HarmonyImportDependency.js#L164
const LINKING_ERROR_TAG = 'was not found in';
// build 时会出现 css modules 的引用警告，但这应该是需要忽略的
const CSS_NO_EXPORTS = /\.(css|sass|scss|styl|less)' \(module has no exports\)/;

// webpack >= 5.110.2 checks missing specifiers even when their bindings are
// never read. Keep those as warnings because they do not affect emitted code.
function isUnusedSpecifierWarning(
  warning: Compilation['warnings'][number],
): boolean {
  const warningModule = warning.module as NormalModule;
  return warningModule.dependencies.some((dependency) => {
    return (
      dependency.loc === warning.loc &&
      'unusedSpecifiers' in dependency &&
      dependency.unusedSpecifiers !== undefined
    );
  });
}

class HarmonyLinkingErrorPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.afterCompile.tap(
      'HarmonyLinkingErrorPlugin',
      (compilation: Compilation) => {
        if (!compilation.warnings.length) {
          return;
        }
        const harmonyLinkingErrors = compilation.warnings.filter((w) => {
          return (
            w.name === 'ModuleDependencyWarning' &&
            !(w.module as NormalModule).resource.includes('node_modules') &&
            w.message.includes(LINKING_ERROR_TAG) &&
            !CSS_NO_EXPORTS.test(w.message) &&
            !isUnusedSpecifierWarning(w)
          );
        });
        if (!harmonyLinkingErrors.length) {
          return;
        }
        compilation.errors.push(...harmonyLinkingErrors);
      },
    );
  }
}
export async function addHarmonyLinkingErrorPlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('harmony-linking-error-plugin').use(HarmonyLinkingErrorPlugin);
}
