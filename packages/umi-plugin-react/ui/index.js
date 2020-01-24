import React from 'react';

export default api => {
  const { ConfigForm } = api;

  api.addConfigSection({
    key: 'umi-plugin-react',
    title: 'umi-plugin-react 配置',
    description: '配置 dva、antd、国际化等等',
    icon: (
      <img
        src="https://img.alicdn.com/tfs/TB1oAwoiET1gK0jSZFhXXaAtVXa-64-64.png"
        width={api.mini ? 24 : 32}
        height={api.mini ? 24 : 32}
      />
    ),
    component: () => (
      <ConfigForm
        title="umi-plugin-react 配置"
        list="org.umi.umi-plugin-react.config.list"
        edit="org.umi.umi-plugin-react.config.edit"
      />
    ),
  });
};
