let a = () => {
  console.log('a');
};

function b(fn) {
  fn();
  setTimeout(fn, 300);
}

b(() => {
  a();
});
a = () => {
  console.log('b');
};
