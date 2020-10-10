module.exports = function (version) {
  return (
    version.includes('-rc.') ||
    version.includes('-beta.') ||
    version.includes('-alpha.')
  );
};
