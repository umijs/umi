import React from 'react';
import { useSnapshot } from 'valtio';
import state from '../state';

function DisplayCount() {
  const snap = useSnapshot(state);
  return <p className="display-count">{snap.number}</p>;
}

export default DisplayCount;
