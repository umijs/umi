export function isTypeScriptFile(path: string) {
  return !/\.d\.ts$/.test(path) && /\.(ts|tsx)$/.test(path);
}
