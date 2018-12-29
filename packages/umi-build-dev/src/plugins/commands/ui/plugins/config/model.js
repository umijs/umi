export default {
  namespace: 'config',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/config') {
          window.socketReady(() => {
            window.send('config/fetch');
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
