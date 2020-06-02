export const ssr = {
  beforeRenderServer: async ({ location }) => {
    global.mockLocation = location;
  }
}
