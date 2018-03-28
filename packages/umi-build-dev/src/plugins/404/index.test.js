import { patchRoutes } from './index';

describe('404', () => {
  it("patchRoutes don't modify if no 404", () => {
    expect(patchRoutes([{ component: 'a' }])).toEqual([{ component: 'a' }]);
  });

  it('patchRoutes resort 404', () => {
    expect(patchRoutes([{ component: '404.js' }, { component: 'a' }])).toEqual([
      { component: 'a' },
      { component: '404.js' },
    ]);
  });

  it('patchRoutes support jsx, ts, tsx', () => {
    expect(patchRoutes([{ component: '404.jsx' }, { component: 'a' }])).toEqual(
      [{ component: 'a' }, { component: '404.jsx' }],
    );
    expect(patchRoutes([{ component: '404.ts' }, { component: 'a' }])).toEqual([
      { component: 'a' },
      { component: '404.ts' },
    ]);
    expect(patchRoutes([{ component: '404.tsx' }, { component: 'a' }])).toEqual(
      [{ component: 'a' }, { component: '404.tsx' }],
    );
  });

  it('patchRoutes strip path and exact', () => {
    expect(
      patchRoutes([
        { component: 'a' },
        { path: '/404', exact: true, component: '404.js' },
      ]),
    ).toEqual([{ component: 'a' }, { component: '404.js' }]);
  });

  it('patchRoutes support nested routes', () => {
    expect(
      patchRoutes([
        {
          component: 'a',
          routes: [{ component: '404.js' }, { component: 'a' }],
        },
      ]),
    ).toEqual([
      {
        component: 'a',
        routes: [{ component: 'a' }, { component: '404.js' }],
      },
    ]);
  });
});
