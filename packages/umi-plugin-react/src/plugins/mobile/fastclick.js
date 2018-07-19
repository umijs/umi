import { winPath } from 'umi-utils';

export default function(api, options) {
  const { IMPORT } = api.placeholder;

  api.register('modifyEntryFile', ({ memo }) => {
    const libraryPath = winPath(
      options.libraryPath || require.resolve('fastclick'),
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
    return memo;
  });
}
