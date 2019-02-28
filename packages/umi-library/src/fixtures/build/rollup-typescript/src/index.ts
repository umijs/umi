
interface IOpts {
  foo: boolean;
}

function foo(opts: IOpts): string {
  return opts.foo ? 'foo' : 'bar';
}

console.log(foo({
  foo: true,
}));
