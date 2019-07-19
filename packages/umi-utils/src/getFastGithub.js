import fetch from 'node-fetch';

const registryMap = {
  'github.com': 'https://github.com/ant-design/pro-blocks.git',
  'github.com.cnpmjs.org': ' https://github.com.cnpmjs.org/ant-design/pro-blocks.git',
};

const getFastGithub = async () => {
  return new Promise(resolve => {
    Object.keys(registryMap).forEach(async key => {
      await fetch(registryMap[key]).then(msg => {
        return msg;
      });
      resolve(key);
    });
  });
};

export default getFastGithub;
