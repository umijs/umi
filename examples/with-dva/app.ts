export const dva = {
  config: {
    onError(e: any) {
      e.preventDefault();
      console.error(e.message);
    },
  },
};
