export default {
  plugins: ['@umijs/plugins/dist/antd'],
  antd: {
    // valid for antd5.0 only
    theme: {
      token: {
        colorPrimary: '#1DA57A',
      },
    },
    /**
     * antd@5.1.0 ~ 5.2.3 仅支持 appConfig: {}, 来启用 <App /> 组件;
     * antd@5.3.0 及以上才支持 appConfig: { // ... } 来添加更多 App 配置项;
     */
    appConfig: {
      message: {
        maxCount: 3,
      },
    },
  },
};
