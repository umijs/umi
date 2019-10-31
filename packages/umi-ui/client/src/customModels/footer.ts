type IPanel = 'log' | 'terminal';

const states = {
  logs: [],
  terminalHeight: 300,
  logHeight: 300,
  terminal: null,
  fitAddon: null,
  visible: {},
};

const reducers = {
  changeSize: (state, { payload }) => {
    const tweakPayload = {};
    Object.keys(payload).forEach(key => {
      if (state[key] && payload[key] > 0) {
        tweakPayload[key] = payload[key];
      }
    });

    return {
      ...state,
      ...tweakPayload,
    };
  },
  add: (state, { payload }) => {
    return {
      ...state.logs,
      logs: [...state.logs, ...payload.logs],
    };
  },
  setHistory: (state, { payload }) => {
    return {
      ...state,
      ...payload,
    };
  },
  initTerminal: (state, { payload }) => {
    return {
      ...state,
      ...payload,
    };
  },
  togglePanel: (state, { payload }) => {
    const { panel } = payload as { panel: IPanel };
    return {
      ...state,
      visible: {
        [panel]: !state.visible[panel],
      },
    };
  },
};

export { reducers, states };
