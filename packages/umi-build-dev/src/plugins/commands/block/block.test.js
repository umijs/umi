import { dependenciesConflictCheck, getNameFromPkg } from './block';

describe('test block generate', () => {
  it('dependenciesConflictCheck', () => {
    const { conflictDeps, lackDeps } = dependenciesConflictCheck(
      {
        react: '>=16.0.0',
        antd: '^3.0.0',
        moment: '^2.3.0',
      },
      {
        react: '^16.1.0',
        moment: '2.1.0',
      },
    );
    expect(conflictDeps).toEqual([['moment', '^2.3.0', '2.1.0']]);
    expect(lackDeps).toEqual([['antd', '^3.0.0']]);
  });

  it('getNameFromPkg', () => {
    expect(
      getNameFromPkg({
        desc: 'test no name',
      }),
    ).toEqual(null);
    expect(
      getNameFromPkg({
        name: 'test-demo',
      }),
    ).toEqual('test-demo');
    expect(
      getNameFromPkg({
        name: '@umi-blocks/demo',
      }),
    ).toEqual('demo');
  });
});
