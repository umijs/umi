class FilterCSSConflictingWarning {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('FilterWarning', compilation => {
      compilation.warnings = (compilation.warnings || []).filter(warning => {
        return !warning.message.includes('Conflicting order between:');
      });
    });
  }
}

export default FilterCSSConflictingWarning;
