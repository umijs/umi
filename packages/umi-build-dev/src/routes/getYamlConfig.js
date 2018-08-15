import extractComments from 'esprima-extract-comments';
import yaml from 'js-yaml';

const debug = require('debug')('umi-build-dev:getYamlConfig');

export default function(code) {
  const comments = extractComments(code);
  return comments
    .slice(0, 1)
    .filter(c => c.value.includes(':'))
    .reduce((memo, { value }) => {
      const v = value.replace(/^(\s+)?\*/gm, '');
      debug(v);
      try {
        const yamlResult = yaml.safeLoad(v);
        return {
          ...memo,
          ...yamlResult,
        };
      } catch (e) {
        console.error(`yaml load failed: ${e}`);
      }
      return memo;
    }, {});
}
