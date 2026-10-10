import { KeepAlive } from 'react-activation';

// React 18: autoFreeze must be false, or cached micro-app forms lose state.
KeepAlive.defaultProps = {
  ...(KeepAlive.defaultProps || {}),
  autoFreeze: false,
};
