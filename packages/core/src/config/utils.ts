import { isAbsolute, join } from 'path';

export function addExt(opts: { file: string; ext: string }) {
  const index = opts.file.lastIndexOf('.');
  return `${opts.file.slice(0, index)}${opts.ext}${opts.file.slice(index)}`;
}

export function getAbsFiles(opts: { files: string[]; cwd: string }) {
  return opts.files.map((file) => {
    return isAbsolute(file) ? file : join(opts.cwd, file);
  });
}
