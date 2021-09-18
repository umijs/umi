export function addExt(opts: { file: string; ext: string }) {
  const index = opts.file.lastIndexOf('.');
  return `${opts.file.slice(0, index)}${opts.ext}${opts.file.slice(index)}`;
}
