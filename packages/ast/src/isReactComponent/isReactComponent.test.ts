import { isReactComponent } from './isReactComponent';

test('jsx', () => {
  expect(isReactComponent(`alert(1);`)).toEqual(false);
});

test('no jsx', () => {
  expect(isReactComponent(`export default () => <p />`)).toEqual(true);
})

test('no React Fragment', () => {
  expect(isReactComponent(`export default () => <>hello</>`)).toEqual(true);
})
