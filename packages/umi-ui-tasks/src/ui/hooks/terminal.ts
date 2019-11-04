import { useEffect } from 'react';
import { FitAddon } from 'xterm-addon-fit';

const useTerminal = ({ terminal, ref: container }) => {
  const fitAddon = new FitAddon();
  useEffect(
    () => {
      if (!container) {
        return;
      }
      terminal.loadAddon(fitAddon);
      terminal.open(container);
      fitAddon.fit();
    },
    [container],
  );
  return {
    fitAddon,
  };
};

export { useTerminal };
