export default {
  namespace: 'routes',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/routes') {
          window.socketReady(() => {
            window.send('routes/fetch');
          });
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
