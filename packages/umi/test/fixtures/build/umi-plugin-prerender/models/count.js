
function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export default {
  state: 0,
  reducers: {
    add(state) {
      return state + 1;
    },
  },
  effects: {
    *init({ type, payload }, { put, call, select }) {
      yield call(delay, 1000);
      yield put({ type: 'add' });
      yield put({ type: 'add' });
    },
  },
}
