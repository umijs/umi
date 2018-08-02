import { join } from 'path';

export default api => {
  api.addRendererWrapperWithComponent(join(__dirname, './wrapper.js'));
};
