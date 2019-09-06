import { useEffect } from 'react';

const useTerminal = ({ terminal, ref: container }) => {
  useEffect(
    () => {
      if (!container) {
        return;
      }
      terminal.open(container);
      terminal.fit();
    },
    [container],
  );
};

export { useTerminal };
