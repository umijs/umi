import React from 'react';
import { useSnapshot } from 'umi';
import state from '../state';

function DisplayCount() {
  const snap = useSnapshot(state);
  return <p className="display-count">{snap.number}</p>;
}

export default DisplayCount;
