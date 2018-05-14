import guess from './guessJSFileFromPath';

describe('guessJSFileFromPath', () => {
  it('normal', () => {
    expect(guess('/a')).toEqual('a.js');
  });

  it('child path', () => {
    expect(guess('/a/b')).toEqual('a/b.js');
  });

  it('add index.js affix', () => {
    expect(guess('/')).toEqual('index.js');
    expect(guess('/a/')).toEqual('a/index.js');
  });

  it('strip .html affix', () => {
    expect(guess('/a.html')).toEqual('a.js');
  });

  it('strip .htm affix', () => {
    expect(guess('/a.htm')).toEqual('a.js');
  });

  it('/index.html', () => {
    expect(guess('/index.html')).toEqual('index.js');
  });
});
