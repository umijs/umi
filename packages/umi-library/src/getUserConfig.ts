import { existsSync } from 'fs';
import AJV from 'ajv';
import slash from 'slash2';
import { relative } from 'path';
import schema from './schema';
import { getExistFile } from './utils';
import { IBundleOptions } from './types';

function testDefault(obj) {
  return obj.default || obj;
}

export const CONFIG_FILES = [
  '.umirc.library.js',
  '.umirc.library.jsx',
  '.umirc.library.ts',
  '.umirc.library.tsx',
];

export default function({ cwd }): IBundleOptions {
  const configFile = getExistFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false,
  });

  if (existsSync(configFile)) {
    const userConfig = testDefault(require(configFile)); // eslint-disable-line
    const ajv = new AJV({ allErrors: true });
    const isValid = ajv.validate(schema, userConfig);
    if (!isValid) {
      const errors = ajv.errors.map(({ dataPath, message }, index) => {
        return `${index + 1}. ${dataPath}${dataPath ? ' ' : ''}${message}`;
      });
      throw new Error(
        `
Invalid options in ${slash(relative(cwd, configFile))}

${errors.join('\n')}
`.trim(),
      );
    }
    return userConfig;
  } else {
    return {};
  }
}
