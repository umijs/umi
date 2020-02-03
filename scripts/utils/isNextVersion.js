module.exports = function(version) {
  return (
    version.include('-rc.') ||
    version.include('-beta.') ||
    version.include('-alpha.')
  );
};
