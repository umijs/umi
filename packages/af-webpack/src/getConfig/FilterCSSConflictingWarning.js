class FilterCSSConflictingWarning {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('FilterWarning', compilation => {
      compilation.warnings = (compilation.warnings || []).filter(warning => {
        return warning.message.indexOf('Conflicting order between:') === -1;
      });
    });
  }
}

export default FilterCSSConflictingWarning;
