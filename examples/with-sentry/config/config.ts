import { defineConfig } from 'umi';

export default defineConfig({
  dva: {},
  antd: {},
  plugins: ['@alitajs/sentry'],
  sentry: {
    // 可以访问 https://sentry.io/ 免费申请，记得选 react 项目类型
    dsn: 'https://abc@o652357.ingest.sentry.io/abc',
    development: true,
  },
});
