export function loadByRequire(f: string): any {
  return require(`./${f}`);
}
