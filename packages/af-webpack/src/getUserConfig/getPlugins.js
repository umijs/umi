import { join } from 'path';
import requireindex from 'requireindex';

export default function() {
  const pluginsMap = requireindex(join(__dirname, './configs'));
  return Object.keys(pluginsMap).map(key => {
    return pluginsMap[key].default();
  });
}
