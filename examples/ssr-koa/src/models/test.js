export default {
  namespace: 'test',
  state: {
    title: null,
  },

  effects: {},

  reducers: {
    test(state, { payload }) {
      state.title = 'hello umi';
    },
  },
};
