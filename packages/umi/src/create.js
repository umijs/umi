import assert from 'assert';
import install from './install';

export default function(opts = {}) {
  const { name, isDva } = opts;
  //这里的地址只是测试，我不知道这两个项目该不该放到umi的团队里面
  //dva版本是dva-cli next 安装的
  //非dva版本是 https://github.com/umijs/umi-examples/tree/master/with-nav-and-sidebar
  //我想项目单独放到github上面，比较好管理，修改脚手架，不需要更新cli
  const gitUrl = isDva
    ? 'https://github.com/umi-cli-test/umi-dva.git'
    : 'https://github.com/umi-cli-test/with-nav-and-sidebar.git';
  assert(name, 'opts.name should be supplied');
  assert(typeof name === 'string', 'opts.name should be string');
  install('git', ['clone', gitUrl, name], () => {
    console.log('create end');
  });
}
