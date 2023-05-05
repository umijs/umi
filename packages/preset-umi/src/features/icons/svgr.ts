import { transform } from '@svgr/core';
import fs from 'fs';
import path from 'path';
import type { IApi } from '../../types';
import { loadIcon } from './loadIcon';

function camelCase(str: string) {
  return str
    .replace(/\//g, '-')
    .replace(/-([a-zA-Z]|[0-9])/g, (g) => g[1].toUpperCase());
}

export function generateIconName(opts: { collect: string; icon: string }) {
  return camelCase(`${opts.collect}-${opts.icon}`);
}

// Example:
// generateSVGR({
//   collect: 'fa',
//   icon: 'home',
//   iconifyOptions: { autoInstall: true },
// })
export async function generateSvgr(opts: {
  collect: string;
  icon: string;
  api: IApi;
  localIconDir: string;
  iconifyOptions?: { autoInstall: any };
  svgrOptions?: object;
}) {
  const componentName = generateIconName(opts);
  let svg: string | undefined;
  if (opts.collect === 'local') {
    svg = loadLocalIcon(opts.icon, opts.localIconDir);
  } else {
    const { autoInstall } = opts?.iconifyOptions || {};
    svg = await loadIcon(opts.collect, opts.icon, {
      cwd: opts.api.cwd,
      autoInstall,
      iconifyLoaderOptions: {
        addXmlNs: false,
      },
    });
  }
  if (!svg) {
    return null;
  }
  return normalizeSvgr(
    await transform(svg, opts.svgrOptions || {}, { componentName }),
  );
}

// TODO: local icon 变更时，重新装载进去
function loadLocalIcon(icon: string, localIconDir: string) {
  const iconPath = path.join(localIconDir, `${icon}.svg`);
  if (!fs.existsSync(iconPath)) {
    return undefined;
  }
  return fs.readFileSync(iconPath, 'utf-8');
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
