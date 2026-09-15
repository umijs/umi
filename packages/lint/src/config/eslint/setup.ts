// The utoo-lint migration tool only reads configuration; it does not load plugins
// through ESLint, which is required by the module resolution patch.
if (process.env.UMI_UTLINT_MIGRATE !== '1') {
  // patch eslint plugin resolve logic
  require('../../../compiled/@rushstack/eslint-patch/lib/modern-module-resolution.js');
}
