export const qiankun = {
  master: {
    routes: [
      {
        path: '/nav',
        microApp: 'slave',
        mode: 'match',
      },
      {
        path: '/count',
        microApp: 'slave',
        mode: 'match',
      },
      {
        path: '/prefix',
        microApp: 'slave',
      },
    ],
  },
};
