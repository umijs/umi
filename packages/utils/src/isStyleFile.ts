export const AUTO_CSS_MODULE_EXTS = [
  '.css',
  '.less',
  '.sass',
  '.scss',
  '.stylus',
  '.styl',
];

const STYLE_EXT_REGX = /\.(:?css|less|scss|sass|stylus|styl)$/;

export const isStyleFile = ({
  filename,
}: {
  filename?: string;
  ext?: string;
}) => {
  return filename && STYLE_EXT_REGX.test(filename);
};
