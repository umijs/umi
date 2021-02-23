import { lodash } from '@umijs/utils';
import set from '@umijs/deps/compiled/set-value';

export function updateUserConfigWithKey({
  key,
  value,
  userConfig,
}: {
  key: string;
  value: any;
  userConfig: object;
}) {
  set(userConfig, key, value);
}

export function getUserConfigWithKey({
  key,
  userConfig,
}: {
  key: string;
  userConfig: object;
}): any {
  return lodash.get(userConfig, key);
}
