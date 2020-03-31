interface A {
  b?: B;
};

interface B {
  c: string;
};

const a: A = {};

console.log(a.b?.c);