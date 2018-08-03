import { join } from 'path';

export default api => {
  api.addRendererWrapperWithComponent(join(__dirname, './wrapper.js'));
  api.addRendererWrapperWithModule(join(__dirname, './wrapper-module.js'));
  api.addRendererWrapperWithModule(join(__dirname, './wrapper-module2.js'));
};
