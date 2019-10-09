import getConstVarsFromPath from './getConstVarsFromPath';

export default (content, { path }) => {
  const vars = getConstVarsFromPath(path);
  const replaceReg = new RegExp(Array.from(vars.keys()).join('|'), 'g');
  return content.replace(replaceReg, match => {
    return vars.get(match);
  });
};
