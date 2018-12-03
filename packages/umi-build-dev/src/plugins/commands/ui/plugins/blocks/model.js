export default {
  namespace: 'blocks',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/blocks') {
          setTimeout(() => {
            window.send('blocks/fetch');
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
