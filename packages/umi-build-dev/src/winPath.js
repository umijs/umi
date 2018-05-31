import slash from 'slash';

export default function(path) {
  const hasChinese = /[^\u4e00-\u9fa5]+/.test(path);
  return hasChinese ? path.replace(/\\/g, '/') : slash(path);
}
