interface IOpts {
  exports: string[];
  code: string;
}

export default function autoExportHandler(opts: IOpts) {
  if (!opts.exports.length) {
    return `${opts.code};\nexport const __mfsu = 1;`;
  }
  return opts.code;
}
