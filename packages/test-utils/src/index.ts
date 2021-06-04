import { render as renderTL } from '@testing-library/react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service as UmiService } from 'umi';

export async function generateTmp(opts: {
  cwd: string;
  Service?: typeof UmiService;
}) {
  const Service = opts.Service || UmiService;
  const service = new Service({
    cwd: opts.cwd,
    plugins: [require.resolve('./plugin')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'tmp'],
    },
  });
}

export async function generateHTML(opts: {
  cwd: string;
  Service?: typeof UmiService;
}) {
  const Service = opts.Service || UmiService;
  const service = new Service({
    cwd: opts.cwd,
    plugins: [require.resolve('./plugin')],
  });
  await service.run({
    name: 'g',
    args: {
      _: ['g', 'html'],
    },
  });
}

export function render(opts: { cwd: string }) {
  return renderTL(require(join(opts.cwd, '.umi-test', 'umi.ts')).default);
}

export function getHTML(opts: { cwd: string }) {
  return readFileSync(join(opts.cwd, 'dist', 'index.html'), 'utf-8');
}
