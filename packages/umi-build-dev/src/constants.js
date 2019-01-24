export const CONFIG_FILES = process.env.UMI_CONFIG_FILE
  ? getConfigFiles(process.env.UMI_CONFIG_FILE)
  : ['.umirc.js', 'config/config.js'];

export const EXT_LIST = ['.js', '.jsx', '.ts', '.tsx'];

export const SINGULAR_SENSLTIVE = [
  'pages',
  'components',
  'models',
  'locales',
  'utils',
  'services',
  'layouts',
];

function getConfigFiles(configFile) {
  return configFile.split(',').filter(v => v && v.trim());
}
