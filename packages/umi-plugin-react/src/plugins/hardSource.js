export default function(api) {
  const {
    config: { react = {} },
  } = api.service;

  // 允许用户通过环境变量覆盖配置
  if (react.hardSource && !('HARD_SOURCE' in process.env)) {
    process.env.HARD_SOURCE = true;
  }
}
