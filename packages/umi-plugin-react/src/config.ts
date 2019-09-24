export const configs = [
  {
    name: 'hd',
    configs: [
      {
        name: 'hd',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启高清方案',
          'en-US': 'Enable HD',
        },
      },
    ],
  },
  {
    name: 'fastClick',
    configs: [
      {
        name: 'fastClick',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 FastClick',
          'en-US': 'Enable FastClick',
        },
      },
      {
        name: 'fastClick.libraryPath',
        type: 'string',
        default: '',
        title: {
          'zh-CN': '指定 FastClick 路径',
          'en-US': 'Specify then the FastClick library is from',
        },
      },
    ],
  },
  {
    name: 'dva',
    configs: [
      {
        name: 'dva',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 Dva',
          'en-US': 'Enable Dva',
        },
      },
      {
        name: 'dva.immer',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '使用 immer 更新状态',
          'en-US': 'Update State With Immer',
        },
      },
      {
        name: 'dva.hmr',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启热更新',
          'en-US': 'Enable Hot Module Replacement',
        },
      },
    ],
  },
  {
    name: 'antd',
    configs: [
      {
        name: 'antd',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 AntD 按需编译',
          'en-US': 'Enable AntD 按需编译',
        },
      },
    ],
  },
];
