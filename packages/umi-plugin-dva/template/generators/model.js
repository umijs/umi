
export default {
  state: '<%= name %>',
  subscriptions: {
    setup({ dispatch, history }) {
    },
  },
  reducers: {
    update(state) {
      return `${state}_<%= name %>`;
    },
  },
  effects: {
    *fetch({ type, payload }, { put, call, select }) {
    },
  },
}
