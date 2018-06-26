export default function(api) {
  api.register('modifyEntryFile', ({ memo }) => {
    return `
import 'umi-plugin-polyfill/lib/global.js';
${memo}`.trim();
  });
}
