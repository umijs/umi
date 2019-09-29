import getYamlConfig from './getYamlConfig';

describe('getYamlConfig', () => {
  it('single comment', () => {
    expect(
      getYamlConfig(`/*
a: b
c:
  d: 1
  e: 2
*/

const a = () => {};
const b = <><div /></>;
const { c } = b;
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
      getYamlConfig(`/**
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
      getYamlConfig(`/*
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

  it('only the first line comment work', () => {
    expect(
      getYamlConfig(`

/*
a: b
*/

alert(1);
    `),
    ).toEqual({});
  });

  it('ignore invalid yaml comment', () => {
    expect(
      getYamlConfig(`/*
 * this is a normal text
 */
    `),
    ).toEqual({});
  });

  it('ignore invalid yaml comment with filepath', () => {
    const { warn } = console;
    console.warn = msg => {
      warn(msg);
      expect(msg.includes('/data/test.js')).toBeTruthy();
    };

    getYamlConfig(
      `/**
    *
    * @param {{onClick: Function, text: string}} opts
    */`,
      '/data/test.js',
    );

    console.warn = warn;
  });
});
