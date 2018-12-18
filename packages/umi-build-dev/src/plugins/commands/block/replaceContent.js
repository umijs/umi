import getConstVarsFromPath from './getConstVarsFromPath';

export default function(content, { path }) {
  const vars = getConstVarsFromPath(path);
  const replaceReg = new RegExp(Object.keys(vars).join('|'), 'g');
  return content.replace(replaceReg, match => {
    return vars[match];
  });
}
