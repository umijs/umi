// @ts-ignore
import * as ErrorOverlay from 'react-error-overlay';
import stripAnsi from 'strip-ansi';
import formatWebpackMessages from './formatWebpackMessages';

let hadRuntimeError = false;
ErrorOverlay.startReportingRuntimeErrors({
  onError: function() {
    hadRuntimeError = true;
  },
});

let isFirstCompilation = true;
let mostRecentCompilationHash: string | null = null;
let hasCompileErrors = false;

export function handleHashChange(hash: string) {
  mostRecentCompilationHash = hash;
}

export function handleSuccess() {
  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  if (isHotUpdate) {
    tryApplyUpdates(() => {
      ErrorOverlay.dismissBuildError();
    });
  }
}

export function handleWarnings(warnings: any) {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  function printWarnings() {
    const formatted = formatWebpackMessages({
      warnings,
      errors: [],
    });
    formatted.warnings.forEach((warning: string) => {
      console.warn(stripAnsi(warning));
    });
  }

  if (isHotUpdate) {
    tryApplyUpdates(() => {
      printWarnings();
      ErrorOverlay.dismissBuildError();
    });
  } else {
    printWarnings();
  }
}

export function handleErrors(errors: any) {
  isFirstCompilation = false;
  hasCompileErrors = true;

  const formatted = formatWebpackMessages({
    errors,
    warnings: [],
  });

  ErrorOverlay.reportBuildError(formatted.errors[0]);

  formatted.errors.forEach((error: string) => {
    console.error(stripAnsi(error));
  });
}

function isUpdateAvailable() {
  // @ts-ignore
  return mostRecentCompilationHash !== __webpack_hash__;
}

function tryApplyUpdates(onHotUpdateSuccess?: Function) {
  // @ts-ignore
  if (!module.hot) {
    window.location.reload();
    return;
  }

  // TODO: is update available?
  // @ts-ignore
  if (!isUpdateAvailable() || module.hot.status() !== 'idle') {
    return;
  }

  function handleApplyUpdates(err: Error | null, updatedModules: any) {
    if (err || !updatedModules || hadRuntimeError) {
      window.location.reload();
      return;
    }

    onHotUpdateSuccess?.();

    if (isUpdateAvailable()) {
      // While we were updating, there was a new update! Do it again.
      tryApplyUpdates();
    }
  }

  // @ts-ignore
  module.hot.check(true).then(
    function(updatedModules: any) {
      handleApplyUpdates(null, updatedModules);
    },
    function(err: Error) {
      handleApplyUpdates(err, null);
    },
  );
}
