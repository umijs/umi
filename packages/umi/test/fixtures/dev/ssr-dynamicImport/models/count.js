export default {
  state: 0,
  reducers: {
    add(state) {
      return state + 1;
    },
    reset(state) {
      return 0;
    }
  },
  effects: {
    *init({ type, payload }, { put, call, select }) {
      yield put({ type: 'add' });
      yield put({ type: 'add' });
    },
  },
}
