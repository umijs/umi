
import { used } from './x';

function unusedFunc() {
  console.log('unusedFunc');
}

function b () {
  return new Promise((resolve, reject) => {
    resolve('b');
  });
}

async function c () {
  const b = await b();
  if (b === 'b') {
    console.log('c');
  }
}

function push(array, ...items) {
  array.push(...items);
}

function add(x, y) {
  return x + y;
}

export { b, c, add };
