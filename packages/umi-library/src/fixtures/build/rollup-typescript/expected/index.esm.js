function foo(opts) {
  return opts.foo ? 'foo' : 'bar';
}

console.log(foo({
  foo: true
}));
