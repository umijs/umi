export const dva = {
  config: {
    onError(e) {
      e.preventDefault();
      console.error(e.message);
    },
  },
  plugins: [
    {
      onAction: () => next => action => {
        console.log('log 1', action.type);
        next(action);
      },
    },
    {
      onAction: () => next => action => {
        console.log('log 3333', action.type);
        next(action);
      },
    },
  ],
};
