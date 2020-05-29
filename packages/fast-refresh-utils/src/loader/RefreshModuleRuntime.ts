/* global $RefreshUtils$ */

/**
 * Code injected to each JS-like module for react-refresh capabilities.
 *
 * `$RefreshUtils$` is replaced to the actual utils during source parsing by `webpack.ProvidePlugin`.
 *
 * The function declaration syntax below is needed for `Template.getFunctionContent` to parse this.
 *
 * [Reference for Runtime Injection](https://github.com/webpack/webpack/blob/b07d3b67d2252f08e4bb65d354a11c9b69f8b434/lib/HotModuleReplacementPlugin.js#L419)
 * [Reference for HMR Error Recovery](https://github.com/webpack/webpack/issues/418#issuecomment-490296365)
 */
module.exports = function () {
  const currentExports = $RefreshUtils$.getModuleExports(module);
  $RefreshUtils$.registerExportsForReactRefresh(currentExports, module.id);

  if (module.hot) {
    const isHotUpdate = !!module.hot.data;
    const prevExports = isHotUpdate ? module.hot.data.prevExports : null;

    if ($RefreshUtils$.isReactRefreshBoundary(currentExports)) {
      module.hot.dispose(
        $RefreshUtils$.createHotDisposeCallback(currentExports),
      );
      module.hot.accept($RefreshUtils$.createHotErrorHandler(module.id));

      if (isHotUpdate) {
        if (
          $RefreshUtils$.isReactRefreshBoundary(prevExports) &&
          $RefreshUtils$.shouldInvalidateReactRefreshBoundary(
            prevExports,
            currentExports,
          )
        ) {
          module.hot.invalidate();
        } else {
          $RefreshUtils$.enqueueUpdate();
        }
      }
    } else {
      if (isHotUpdate && $RefreshUtils$.isReactRefreshBoundary(prevExports)) {
        module.hot.invalidate();
      }
    }
  }
};
