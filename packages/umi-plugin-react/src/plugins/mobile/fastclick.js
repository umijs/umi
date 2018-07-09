export default function(api) {
  const { config } = api.service;
  const { IMPORT } = api.placeholder;
  const { winPath } = api.utils;

  api.register('modifyEntryFile', ({ memo }) => {
    const { react = {} } = config;
    if (react.fastClick) {
      const libraryPath = winPath(
        react.fastClick.libraryPath || require.resolve('fastclick'),
      );
      memo = memo.replace(
        IMPORT,
        `
import FastClick from '${libraryPath}';
${IMPORT}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    FastClick.attach(document.body);
  },
  false,
);
  `.trim(),
      );
    }
    return memo;
  });
}
