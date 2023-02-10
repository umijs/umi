import { isReactComponent } from './isReactComponent';

test('jsx', () => {
  expect(isReactComponent(`alert(1);`)).toBe(false);
});

test('no jsx', () => {
  expect(isReactComponent(`export default () => <p />`)).toBe(true);
});

test('React Fragment with shorthand', () => {
  expect(isReactComponent(`export default () => <>hello</>`)).toBe(true);
});

test('React vars', () => {
  expect(
    isReactComponent(
      `export default () => { const App = (<>hello</>); return App; }`,
    ),
  ).toBe(true);
});
