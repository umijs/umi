import { Config } from '@umijs/test';
import { existsSync, statSync } from 'fs';
import { Service } from './service/service';

export * from '@umijs/test';

function getAliasPathWithKey(
  alias: Record<string, string>,
  key: string,
): string {
  const thePath = alias[key];
  if (alias[thePath]) {
    return getAliasPathWithKey(alias, thePath);
  }
  return thePath;
}

let service: Service;

export async function configUmiAlias(config: Config.InitialOptions) {
  if (!service) {
    service = new Service();
    await service.run2({
      name: 'setup',
      args: { quiet: true },
    });
  }
  config.moduleNameMapper ||= {};
  const { alias } = service.config;
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
