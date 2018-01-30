export const UPDATE_VALUE = 'UPDATE_VALUE';

export function updateValue(value) {
  return function(dispatch, getState) {
    dispatch({
      type: UPDATE_VALUE,
      payload: value,
    });
  };
}
