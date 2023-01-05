import { loadNodeIcon } from '@iconify/utils/lib/loader/node-loader';
import { transform } from '@svgr/core';

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Example:
// generateSVGR({
//   collect: 'fa',
//   icon: 'home',
//   iconifyOptions: { autoInstall: true },
// })
export async function generateSVGR(opts: {
  collect: string;
  icon: string;
  iconifyOptions?: object;
  svgrOptions?: object;
}) {
  const warn = `${opts.collect}/${opts.icon}`;
  const componentName = camelCase(`${opts.collect}-${opts.icon}`);
  const svg = await loadNodeIcon(opts.collect, opts.icon, {
    warn,
    addXmlNs: false,
    autoInstall: false,
    ...opts.iconifyOptions,
  });
  if (!svg) {
    return null;
  }
  return normalizeSvgr(
    await transform(svg, opts.svgrOptions || {}, { componentName }),
  );
}

function normalizeSvgr(str: string) {
  return str
    .split('\n')
    .filter((line) => {
      if (line.startsWith('import * as React from "react";')) return false;
      if (line.startsWith('export default ')) return false;
      return true;
    })
    .join('\n');
}

// generateSVGR({
//   collect: 'fa',
//   icon: 'home',
// }).then(() => {
//   console.log('done');
// }).catch(e => {
//   console.error('error', e);
// })
