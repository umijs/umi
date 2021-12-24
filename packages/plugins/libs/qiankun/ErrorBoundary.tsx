// @ts-nocheck
/* eslint-disable */
import React from 'react';

export const ErrorBoundary = ({ error }: { error: any }) => (
  <div>{error?.message}</div>
);
