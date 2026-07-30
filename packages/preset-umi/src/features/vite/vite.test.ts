import { isNodeVersionSupported, SUPPORTED_NODE_VERSION } from './vite';

test.each(['v20.19.0', '20.20.0', 'v22.12.0', 'v23.0.0', 'v24.0.0'])(
  '%s satisfies the Vite 7 Node.js requirement',
  (version) => {
    expect(isNodeVersionSupported(version)).toBe(true);
  },
);

test.each(['v14.21.3', 'v18.20.8', 'v20.18.1', 'v21.7.3', 'v22.11.0'])(
  `%s does not satisfy ${SUPPORTED_NODE_VERSION}`,
  (version) => {
    expect(isNodeVersionSupported(version)).toBe(false);
  },
);
