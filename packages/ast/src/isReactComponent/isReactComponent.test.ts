import { isReactComponent } from './isReactComponent';

test('jsx', () => {
  expect(isReactComponent(`alert(1);`)).toEqual(false);
});

test('no jsx', () => {
  expect(isReactComponent(`export default () => <p />`)).toEqual(true);
});

test('React Fragment with shorthand', () => {
  expect(isReactComponent(`export default () => <>hello</>`)).toEqual(true);
});

test('React vars', () => {
  expect(
    isReactComponent(
      `export default () => { const App = (<>hello</>); return App; }`,
    ),
  ).toEqual(true);
});
