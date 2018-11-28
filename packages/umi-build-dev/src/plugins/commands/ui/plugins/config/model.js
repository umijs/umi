export default {
  namespace: 'routes',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/config') {
          console.log('config fetch');
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
};
