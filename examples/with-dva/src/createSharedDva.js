import dva from 'dva';

let instance = null;

export default function() {
  if (!instance) {
    instance = dva();
    instance.model(require('./models/global').default);
  }
  return instance;
}
