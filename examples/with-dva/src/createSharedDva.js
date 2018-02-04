import dva from 'dva';

let app;

export default () => {
  if (!app) {
    app = dva();
  }
  return app;
};
