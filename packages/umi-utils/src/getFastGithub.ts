import fetch from 'node-fetch';

const registryMap = {
  'github.com': 'https://github.com/ant-design/ant-design.git',
  'gitee.com': 'https://gitee.com/ant-design/pro-blocks',
};

/**
 * Get the fast registry Url(github.com or gitee.com)
 */
const getFastGithub = async () => {
  const promiseList = Object.keys(registryMap).map(async key => {
    return fetch(registryMap[key])
      .catch(() => null)
      .then(() => Promise.resolve(key));
  });
  try {
    const url = await Promise.race(promiseList);
    return url;
  } catch (e) {
    return 'github.com';
  }
};

export default getFastGithub;
