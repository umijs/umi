import isReactComponent from './isReactComponent';

describe('isReactComponent', () => {
  test('normal', () => {
    expect(isReactComponent(`() => {}`)).toEqual(true);
    expect(isReactComponent(`()  => {}`)).toEqual(true);
    expect(isReactComponent(`()=> {}`)).toEqual(true);
    expect(isReactComponent(`(props) => {}`)).toEqual(true);
  });
});
