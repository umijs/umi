import { Config } from '@umijs/test';
import { existsSync, statSync } from 'fs';
import { Service } from './service/service';

export * from '@umijs/test';

export function getAliasPathWithKey(
  alias: Record<string, string>,
  key: string,
): string {
  const aliasKeys = Object.keys(alias);

  const unaliased = aliasKeys
    .filter((k) => key.startsWith(k))
    .sort((k1, k2) => {
      return k2.length - k1.length;
    });

  if (unaliased.length) {
    const bestKey = unaliased[0];
    const realPath = alias[bestKey];

    const newKey = key.replace(new RegExp(`^${bestKey}`), realPath);

    return getAliasPathWithKey(alias, newKey);
  } else {
    return key;
  }
}

let service: Service;

export async function getUmiAlias() {
  if (!service) {
    service = new Service();
    await service.run2({
      name: 'setup',
      args: { quiet: true },
    });
  }
  return service.config.alias;
}

export async function configUmiAlias(config: Config.InitialOptions) {
  config.moduleNameMapper ||= {};
  const alias = await getUmiAlias();
  for (const key of Object.keys(alias)) {
    const aliasPath = getAliasPathWithKey(alias, key);
    if (existsSync(aliasPath) && statSync(aliasPath).isDirectory()) {
      config.moduleNameMapper[`^${key}/(.*)$`] = `${aliasPath}/$1`;
      config.moduleNameMapper[`^${key}$`] = aliasPath;
    } else {
      config.moduleNameMapper[`^${key}$`] = aliasPath;
    }
  }
  return config;
}
