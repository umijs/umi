export const ssr = {
  beforeRenderServer: async ({ location }: any) => {
    //@ts-ignore
    global.mockLocation = location;
  },
};
