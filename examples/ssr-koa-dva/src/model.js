export default {
  namespace: 'page',
  state: {
    pageData: {},
  },
  reducers: {
    init(state, action) {
      const pageData = action.payload.pageData;
      return { ...state, pageData };
    },
  },
  effects: {},
};
