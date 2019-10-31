import { isValidFolderName } from './index';

describe('utils', () => {
  it('isValidFolderName', () => {
    expect(isValidFolderName('hello')).toBeTruthy();
    expect(isValidFolderName('^ello')).toBeFalsy();
    expect(isValidFolderName('@hello')).toBeFalsy();
    expect(isValidFolderName('Hello.jx')).toBeTruthy();
    expect(
      isValidFolderName(
        'hellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohel',
      ),
    ).toBeFalsy();
  });
});
