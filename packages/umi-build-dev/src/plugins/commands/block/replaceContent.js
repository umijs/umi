import getConstVarsFromPath from './getConstVarsFromPath';

export default function(content, { path }) {
  const vars = getConstVarsFromPath(path);
  Object.keys(vars).forEach(key => {
    content = content.replace(new RegExp(key, 'g'), vars[key]);
  });
  return content;
}
