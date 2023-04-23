export function sortByAffix(opts: { arr: string[]; affix: string }) {
  return opts.arr.sort((a, b) => {
    if (a.endsWith(opts.affix) && b.endsWith(opts.affix)) return 0;
    if (a.endsWith(opts.affix)) return -1;
    if (b.endsWith(opts.affix)) return 1;
    else return 0;
  });
}
