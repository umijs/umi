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
  let ret = userConfig;
  for (const k of key.split('.')) {
    if (k in ret) {
      ret = ret[k];
    } else {
      return undefined;
    }
  }
  return ret;
}
