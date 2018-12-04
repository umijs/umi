export default {
  namespace: 'blocks',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/blocks') {
          window.socketReady(() => {
            window.send('blocks/fetch');
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
