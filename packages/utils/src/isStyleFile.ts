import { extname } from 'path';

export const AUTO_CSS_MODULE_EXTS = [
  '.css',
  '.less',
  '.sass',
  '.scss',
  '.stylus',
  '.styl',
];

export const isStyleFile = ({
  filename,
  ext,
}: {
  filename?: string;
  ext?: string;
}) => {
  return AUTO_CSS_MODULE_EXTS.includes(ext ?? extname(filename!));
};
