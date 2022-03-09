import { createModel } from '@rematch/core';
import type { RootModel } from '.';
import type { RootState } from '../store';

export type CounterState = number;

export const counter = createModel<RootModel>()({
  state: 0,
  reducers: {
    increment: (state, payload: number) => state + payload,
    decrement: (state, payload: number) => state - payload,
  },
  effects: (dispatch) => ({}),
});

export const selectCount = (state: RootState) => state.counter;
