export const dva = {
  config: {
    onError(err: any) {
      err.preventDefault();
      alert(err.message);
    },
    initialState: {
      global: {
        text: 'hi umi + dva!!!!',
      },
    },
  },
};
