export default {
  namespace: 'global',
  state: {
    text: 'hello umi+dva',
  },
  reducers: {
    setText(state) {
      return {
        text: 'setted',
      };
    },
  },
  effects: {
    *throwError() {
      throw new Error('hi error');
    },
  },
};
