import { KeepAlive } from 'react-activation';

// React 18: autoFreeze must be false, or cached page forms lose state.
KeepAlive.defaultProps = {
  ...(KeepAlive.defaultProps || {}),
  autoFreeze: false,
};
