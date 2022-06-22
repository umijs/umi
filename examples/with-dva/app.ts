const performanceRecord = () => ({
  // @ts-ignore
  onEffect: (effect, { put }, model, actionType) => {
    // @ts-ignore
    return function* (...args) {
      const start = performance.now();
      yield effect(...args);
      console.log(`${actionType} ${performance.now() - start}`);
    };
  },
});

export const dva = {
  config: {
    onError(e: any) {
      e.preventDefault();
      console.error(e.message);
    },
  },
  plugins: [performanceRecord()],
};
