// upper framework should also set env.UMI_PRESETS
// upper framework first
process.env.UMI_PRESETS =
  process.env.UMI_PRESETS || [require.resolve('./dist/preset')].join(',');
module.exports = require('umi/test');
