// refer: https://github.com/umijs/umi/blob/867e0c196296efbbdb95203cca35db2fa639808b/packages/bundler-webpack/src/utils/browsersList.ts#L5
export function getBrowserlist(targets: Record<string, string | boolean>) {
  return (
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    })
  );
}
