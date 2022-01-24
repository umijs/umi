import React from 'react';
import state from '../state';

function ControlCount() {
  return (
    <div>
      <button onClick={() => state.number++}>+</button>
      <button onClick={() => state.number--}>-</button>
    </div>
  );
}

export default ControlCount;
