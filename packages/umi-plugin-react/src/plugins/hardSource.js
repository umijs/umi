export default function() {
  // 允许用户通过环境变量覆盖配置
  if (!('HARD_SOURCE' in process.env)) {
    process.env.HARD_SOURCE = true;
  }
}
