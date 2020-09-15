import delay from './delay';

test('delay', (callback) => {
  let count = 0;
  delay(100).then(() => {
    count += 1;
    callback();
  });
  expect(count).toEqual(0);
});
