export function assert(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

export function compose({
  fns,
  args,
}: {
  fns: (Function | any)[];
  args?: object;
}) {
  if (fns.length === 1) {
    return fns[0];
  }
  const last = fns.pop();
  return fns.reduce((a, b) => () => b(a, args), last);
}

export function isPromiseLike(obj: any) {
  return !!obj && typeof obj === 'object' && typeof obj.then === 'function';
}
