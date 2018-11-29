export default {
  namespace: 'config',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/config') {
          setTimeout(() => {
            window.send('config/fetch');
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
};
