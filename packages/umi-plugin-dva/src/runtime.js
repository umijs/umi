import React from 'react';
import { _DvaContainer } from '@tmp/dva';

export function rootContainer(container) {
  return React.createElement(_DvaContainer, null, container);
}
