import { randomColor } from './randomColor';

test('randomColor', () => {
  expect(randomColor().toString()).toContain('rgb(');
});
