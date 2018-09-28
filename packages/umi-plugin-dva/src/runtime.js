import React from 'react';
const DvaContainer = require('@tmp/DvaContainer').default;

export function rootContainer(container) {
  return React.createElement(DvaContainer, null, container);
}
