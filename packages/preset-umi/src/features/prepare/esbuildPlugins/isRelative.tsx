export function isRelativePath(p: string): boolean {
  return p.startsWith('./') || p.startsWith('../');
}
