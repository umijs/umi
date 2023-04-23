import { RootState } from '../store';

const initialState = 0;

export const selectCount = (state: RootState) => state.counter;

export default function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'counter/increment': {
      return state + 1;
    }
    case 'counter/decrement': {
      return state - 1;
    }
    default:
      return state;
  }
}

export function incrementAction() {
  return { type: 'counter/increment' };
}

export function decrementAction() {
  return { type: 'counter/decrement' };
}
