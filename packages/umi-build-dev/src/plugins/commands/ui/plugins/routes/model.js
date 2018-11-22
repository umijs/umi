async function fetchRoutes() {
  return window.fetch('/api/routes').then(res => res.json());
}

export default {
  namespace: 'routes',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/routes') {
          setTimeout(() => {
            window.send('routes/fetch');
          }, 1000);
        }
      });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        data: payload,
      };
    },
  },
  effects: {
    *fetch(_, { put, call }) {
      const routes = yield call(fetchRoutes);
      yield put({
        type: 'saveRoutes',
        payload: routes,
      });
    },
  },
};
