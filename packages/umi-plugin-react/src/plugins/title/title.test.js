import { modifyRoutes } from './index';

describe('modifyRoutes', () => {
  it('option is undefined', () => {
    // should not change anything when option is undefined
    const routes = [
      {
        title: 'test',
        routes: [
          {
            title: 'child',
          },
        ],
      },
    ];
    expect(modifyRoutes(routes)).toEqual([
      {
        title: 'test',
        routes: [
          {
            title: 'child',
          },
        ],
      },
    ]);
  });

  it('option is default title', () => {
    const routes = [
      {
        routes: [
          {
            title: 'child',
            routes: [
              {},
              {
                title: 'testc',
              },
            ],
          },
        ],
      },
      {
        title: 'hahah',
      },
      {
        routes: [
          {
            routes: [
              {
                routes: [
                  {
                    title: 'longlong',
                  },
                  {},
                ],
              },
            ],
          },
        ],
      },
    ];
    expect(modifyRoutes(routes, 'abc')).toEqual([
      {
        _title: 'abc',
        _title_default: 'abc',
        routes: [
          {
            title: 'child',
            _title: 'child',
            _title_default: 'abc',
            routes: [
              {
                _title: 'child',
                _title_default: 'abc',
              },
              {
                title: 'testc',
                _title: 'child - testc',
                _title_default: 'abc',
              },
            ],
          },
        ],
      },
      {
        title: 'hahah',
        _title: 'hahah',
        _title_default: 'abc',
      },
      {
        _title: 'abc',
        _title_default: 'abc',
        routes: [
          {
            _title: 'abc',
            _title_default: 'abc',
            routes: [
              {
                _title: 'abc',
                _title_default: 'abc',
                routes: [
                  {
                    _title: 'longlong',
                    _title_default: 'abc',
                    title: 'longlong',
                  },
                  {
                    _title: 'abc',
                    _title_default: 'abc',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('format', () => {
    const routes = [
      {
        routes: [
          {
            title: 'child',
            routes: [
              {
                routes: [
                  {
                    title: 'last',
                  },
                ],
              },
              {
                title: 'testc',
              },
            ],
          },
        ],
      },
      {
        title: 'hahah',
      },
    ];
    expect(
      modifyRoutes(routes, {
        defaultTitle: 'abc',
        format: '{current}{separator}{parent}',
        separator: ' ',
      }),
    ).toEqual([
      {
        _title: 'abc',
        _title_default: 'abc',
        routes: [
          {
            title: 'child',
            _title: 'child',
            _title_default: 'abc',
            routes: [
              {
                _title: 'child',
                _title_default: 'abc',
                routes: [
                  {
                    title: 'last',
                    _title: 'last child',
                    _title_default: 'abc',
                  },
                ],
              },
              {
                title: 'testc',
                _title: 'testc child',
                _title_default: 'abc',
              },
            ],
          },
        ],
      },
      {
        title: 'hahah',
        _title: 'hahah',
        _title_default: 'abc',
      },
    ]);
  });
});
