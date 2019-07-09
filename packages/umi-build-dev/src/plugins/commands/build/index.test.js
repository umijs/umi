import { getClientStats } from '.';

describe('build/index.js', () => {
  it('test getClientStats normal', () => {
    const stats = [
      {
        compilation: [],
        hash: '52ba2bbb1f70454e9f95',
        startTime: 1562686266626,
        endTime: 1562686277441,
      },
      {
        compilation: [],
        hash: 'ca981e43edf452bd2dda',
        startTime: 1562686266677,
        endTime: 1562686276354,
      },
    ];
    expect(getClientStats(stats)).toEqual(stats[0]);
  });

  it('test getClientStats object', () => {
    const stats = {
      compilation: [],
      hash: '52ba2bbb1f70454e9f95',
      startTime: 1562686266626,
      endTime: 1562686277441,
    };
    expect(getClientStats(stats)).toEqual(stats);
  });

  it('test getClientStats other', () => {
    const stats = null;
    expect(getClientStats(stats)).toEqual({});
  });
});
