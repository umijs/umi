import { lodash } from '@umijs/utils';
// @ts-ignore
import set from 'set-value';

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
