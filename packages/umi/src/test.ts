import { Config } from '@umijs/test';
import { existsSync, statSync } from 'fs';
import { Service } from './service/service';

export * from '@umijs/test';

export function getAliasPathWithKey(
  alias: Record<string, string>,
  key: string,
): string {
  if (alias[key]) {
    return getAliasPathWithKey(alias, alias[key]);
  }

  const aliasKeys = Object.keys(alias);
  const keyStartedWith = aliasKeys.find(
    (k) => !k.endsWith('$') && key.startsWith(`${k}/`),
  );

  if (keyStartedWith) {
    const realPath = alias[keyStartedWith];
    const newKey = realPath + key.slice(keyStartedWith.length);

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
    if (key.endsWith('$')) {
      config.moduleNameMapper[`^${key}`] = aliasPath;
    } else if (existsSync(aliasPath) && statSync(aliasPath).isDirectory()) {
      config.moduleNameMapper[`^${key}/(.*)$`] = `${aliasPath}/$1`;
      config.moduleNameMapper[`^${key}$`] = aliasPath;
    } else {
      config.moduleNameMapper[`^${key}$`] = aliasPath;
    }
  }
  return config;
}
