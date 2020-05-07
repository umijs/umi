export const ssr = {
  modifyWindowInitialVars: (memo, { serialize }) => {
    return {
      ...memo,
      'window.__TEST__': serialize({ hello: 'world' }),
    };
  },
};
