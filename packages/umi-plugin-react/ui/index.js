import React from 'react';

export default api => {
  api.addConfigSection({
    key: 'umi-plugin-react',
    title: 'umi-plugin-react 配置',
    description: '配置 dva、antd、国际化等等',
    icon: (
      <img
        src="https://img.alicdn.com/tfs/TB1aqdSeEY1gK0jSZFMXXaWcVXa-64-64.png"
        width={32}
        height={32}
      />
    ),
    component: () => <div>TODO</div>,
  });
};
