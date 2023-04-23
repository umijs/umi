import { logger } from '@umijs/utils';
import { parseAlias } from './utils';

function matches(pattern: string | RegExp, importee: string) {
  if (pattern instanceof RegExp) {
    return pattern.test(importee);
  }
  if (importee.length < pattern.length) {
    return false;
  }
  if (importee === pattern) {
    return true;
  }
  return importee.startsWith(pattern + '/');
}

interface Options {
  alias: Record<string, string>;
}

export default class LessAliasPlugin {
  constructor(private options: Options) {}
  install(less: LessStatic, pluginManager: Less.PluginManager) {
    const alias = parseAlias(this.options.alias);

    function resolveId(filename: string) {
      if (!filename) {
        return null;
      }

      // First match is supposed to be the correct one
      const matchedEntry = alias.find((entry) => matches(entry.find, filename));
      if (!matchedEntry) {
        return filename;
      }

      const resolvedPath = filename.replace(
        matchedEntry.find,
        matchedEntry.replacement,
      );
      return resolvedPath;
    }

    class AliasePlugin extends less.FileManager {
      loadFile(
        filename: string,
        currentDirectory: string,
        options: Less.LoadFileOptions,
        enviroment: Less.Environment,
      ) {
        let resolved;
        try {
          resolved = resolveId(filename);
        } catch (error) {
          logger.error(error);
        }
        if (!resolved) {
          const error = new Error(
            `[less-plugin-alias]: '${filename}' not found.`,
          );
          logger.error(error);
          throw error;
        }

        return super.loadFile(resolved, currentDirectory, options, enviroment);
      }

      loadFileSync(
        filename: string,
        currentDirectory: string,
        options: Less.LoadFileOptions,
        enviroment: Less.Environment,
      ) {
        let resolved;
        try {
          resolved = resolveId(filename);
        } catch (error) {
          logger.error(error);
        }
        if (!resolved) {
          const error = new Error(
            `[less-plugin-alias]: '${filename}' not found.`,
          );
          logger.error(error);
          throw error;
        }

        return super.loadFileSync(
          resolved,
          currentDirectory,
          options,
          enviroment,
        );
      }
    }

    pluginManager.addFileManager(new AliasePlugin());
  }
}
