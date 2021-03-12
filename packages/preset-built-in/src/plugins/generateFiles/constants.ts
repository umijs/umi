import { winPath } from '@umijs/utils';
import { dirname } from 'path';

export const runtimePath = winPath(
  dirname(require.resolve('@umijs/runtime/package.json')),
);
export const renderReactPath = winPath(
  require.resolve('@umijs/renderer-react'),
);
