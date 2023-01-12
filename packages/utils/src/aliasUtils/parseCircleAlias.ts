import { isAbsolute } from 'path';
import { existsSync } from '../../compiled/fs-extra';
import { getAliasValue } from './getAliasValue';

const DEFAULT_MAX_DEPTH = 5;

export const parseCircleAlias = (opts: {
  alias: Record<string, string>;
  maxDepth?: number;
}) => {
  const { alias, maxDepth = DEFAULT_MAX_DEPTH } = opts;
  const isExist = (value: string) => {
    return value.startsWith('.') || isAbsolute(value) || existsSync(value);
  };

  const parsed: Record<string, any> = {};
  Object.entries(alias).forEach(([key, value]) => {
    if (isExist(value)) {
      parsed[key] = value;
    } else {
      let realPath = value;
      // check deeper if `realPath` is alias
      for (let i = 0; i < maxDepth; i++) {
        const deeperPath = getAliasValue({ imported: realPath, alias });
        if (!deeperPath) {
          // maybe used like `tsconfig-paths-webpack-plugin` to resolve path
          parsed[key] = realPath;
          break;
        } else {
          if (isExist(deeperPath)) {
            parsed[key] = deeperPath;
            break;
          } else {
            realPath = deeperPath;
          }
        }
        if (i === maxDepth - 1) {
          throw Error(
            `endless loop detected in resolve alias for '${key}': '${value}', please check your alias config.`,
          );
        }
      }
    }
  });
  return parsed;
};
