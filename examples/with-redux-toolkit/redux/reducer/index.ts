import { combineReducers } from '@reduxjs/toolkit';

import counterReducer from './counterSlice';

const rootReducer = combineReducers({
  counter: counterReducer,
});

export default rootReducer;
