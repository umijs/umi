const routes = [
  {
    path: '/parent',
    wrappers: [],
    routes: [
      {
        path: '/',
      },
      {
        path: '.',
      },
      {
        path: '/children',
        exact: false,
      },
    ],
  },
];

export default routes;
