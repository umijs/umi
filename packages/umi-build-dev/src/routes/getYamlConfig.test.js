import getYamlConfig from './getYamlConfig';

describe('getYamlConfig', () => {
  it('single comment', () => {
    expect(
      getYamlConfig(`
/*
a: b
c:
  d: 1
  e: 2
*/

alert(1);
    `),
    ).toEqual({
      a: 'b',
      c: {
        d: 1,
        e: 2,
      },
    });
  });

  it('comment with * prefix', () => {
    expect(
      getYamlConfig(`
/**
 * a: b
 * c: d
 **/

alert(1);
    `),
    ).toEqual({
      a: 'b',
      c: 'd',
    });
  });

  it('only first comment work', () => {
    expect(
      getYamlConfig(`
/*
a: b
*/

alert(1);

/*
c: d
*/
    `),
    ).toEqual({
      a: 'b',
    });
  });
});
