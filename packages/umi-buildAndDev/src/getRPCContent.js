import { join } from 'path';

const address = require('address');

export default function getRPCContent(cwd) {
  const isDev = process.env.NODE_ENV === 'development';
  const isMock = process.env.IS_MOCK === 'true';
  const pkg = require(join(cwd, 'package.json'));

  let tpl = `
import { createRPC } from 'koi/rpc';
`;

  const rpcConfig = buildRPCConfig(pkg);
  // 开发阶段要设置转发地址
  if (isDev) {
    if (isMock) {
      tpl += `
import {
  mockInvoke,
  restoreInvoke,
} from 'koi/mockDev';

mockInvoke();
`;
    }
    tpl += `
const rpcConfig = {
  appName: '${rpcConfig.appName}',
  forward: '${rpcConfig.forward}',
  env: '${isDev ? 'dev' : 'prod'}'
};
`;
  } else {
    tpl += `
const rpcConfig = {
  appName: '${rpcConfig.appName}',
};
`;
  }

  tpl += `
createRPC(rpcConfig);
`;

  return tpl;
}

// 生成 rpc 的配置代码
function buildRPCConfig(pkg) {
  return {
    forward: getIP(),
    appName: pkg.name,
  };
}

function getIP() {
  const vpnIp = address.ip('utun');
  const ip = address.ip();
  const localIp = vpnIp || ip;

  return localIp;
}
