import { DEFAULT_ESBUILD_TARGET_KEYS } from '../constants';

interface IOpts {
  targets: Record<string, any>;
}

export function getEsBuildTarget({ targets }: IOpts) {
  return Object.keys(targets)
    .filter((key) => DEFAULT_ESBUILD_TARGET_KEYS.includes(key))
    .map((key) => {
      return `${key}${targets[key] === true ? '0' : targets[key]}`;
    });
}
