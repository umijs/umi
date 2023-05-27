import type {
  BuildFailure,
  BuildResult,
  Message,
  Plugin,
} from '@umijs/bundler-utils/compiled/esbuild';

// Fork from esbuild https://github.com/evanw/esbuild/blob/main/lib/shared/common.ts#L1640
function failureErrorWithLog(
  text: string,
  errors: Message[],
  warnings: Message[],
): BuildFailure {
  let limit = 5;
  let summary =
    errors.length < 1
      ? ''
      : ` with ${errors.length} error${errors.length < 2 ? '' : 's'}:` +
        errors
          .slice(0, limit + 1)
          .map((e, i) => {
            if (i === limit) return '\n...';
            if (!e.location) return `\nerror: ${e.text}`;
            let { file, line, column } = e.location;
            let pluginText = e.pluginName ? `[plugin: ${e.pluginName}] ` : '';
            return `\n${file}:${line}:${column}: ERROR: ${pluginText}${e.text}`;
          })
          .join('');
  let error: any = new Error(`${text}${summary}`);
  error.errors = errors;
  error.warnings = warnings;
  return error;
}

export function esbuildWatchRebuildPlugin(options: {
  onRebuild: (error: BuildFailure | null, result: BuildResult | null) => void;
}): Plugin {
  return {
    name: 'watch-rebuild-plugin',
    setup(build) {
      let count = 0;
      build.onEnd((result) => {
        if (count++ === 0) {
          return;
        }
        if (result.errors.length > 0) {
          options.onRebuild(
            failureErrorWithLog('Build failed', result.errors, result.warnings),
            null,
          );
          return;
        }
        options.onRebuild(null, result);
      });
    },
  };
}
