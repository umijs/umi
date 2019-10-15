function send(message) {
  if (process.send) {
    process.send(message);
  }
}

class CompileStatusWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compile.tap('umi-ui-compile-status compile', () => {
      send({
        type: 'org.umi.ui.bubble.showLoading',
      });
    });
    compiler.hooks.done.tap('umi-ui-compile-status done', () => {
      send({
        type: 'org.umi.ui.bubble.hideLoading',
      });
    });
  }
}

export default CompileStatusWebpackPlugin;
