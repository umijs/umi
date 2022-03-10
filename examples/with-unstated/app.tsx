import React from 'react';
import { StoreContainer } from './unstated';

export function rootContainer(container, opts) {
  return React.createElement(StoreContainer.Provider, opts, container);
}
