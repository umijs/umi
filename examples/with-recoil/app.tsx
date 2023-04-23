import React from 'react';
import { RecoilRoot } from 'recoil';

export function rootContainer(container, opts) {
  return React.createElement(RecoilRoot, opts, container);
}
