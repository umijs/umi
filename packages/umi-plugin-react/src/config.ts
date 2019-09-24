export const groupMap = {
  'data-flow': {
    'zh-CN': '数据流',
    'en-US': 'Data Flow',
  },
  'ui-library': {
    'zh-CN': 'UI 库',
    'en-US': 'UI Library',
  },
  i18n: {
    'zh-CN': '国际化',
    'en-US': 'i18n',
  },
  other: {
    'zh-CN': '其他',
    'en-US': 'Other',
  },
};

export const configs = [
  {
    configs: [
      {
        group: 'ui-library',
        name: 'antd',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 AntD 按需编译',
          'en-US': 'Enable AntD 按需编译',
        },
        description: '基于 babel-plugin-import，同时开启 antd 和 antd-mobile 的按需编译。',
      },
    ],
  },
  {
    configs: [
      {
        group: 'data-flow',
        name: 'dva',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 Dva',
          'en-US': 'Enable Dva',
        },
        description: '内置 dva-loading 和 dva-immer，内置 query-string 处理，约定式 Model 等。',
        link: {
          'zh-CN': 'https://umijs.org/zh/guide/with-dva.html',
          'en-US': 'https://umijs.org/guide/with-dva.html',
        },
      },
      {
        group: 'data-flow',
        name: 'dva.immer',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '使用 immer 更新状态',
          'en-US': 'Update State With Immer',
        },
        description: '适用于深层数据结构，修改方便。',
      },
      {
        group: 'data-flow',
        name: 'dva.hmr',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启热更新',
          'en-US': 'Enable Hot Module Replacement',
        },
        description: '基于 babel-plugin-dva-hmr 。',
      },
    ],
  },
  {
    configs: [
      {
        group: 'i18n',
        name: 'locale',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启国际化方案',
          'en-US': 'Enable i18n',
        },
        description: '基于 umi-plugin-locale 和 react-intl 实现，用于解决 i18n 问题。',
        link: {
          'zh-CN': 'https://umijs.org/zh/plugin/umi-plugin-react.html#locale',
          'en-US': 'https://umijs.org/plugin/umi-plugin-react.html#locale',
        },
      },
      {
        group: 'i18n',
        name: 'locale.default',
        type: 'list',
        choices: ['zh-CN', 'en-US'],
        default: 'zh-CN',
        title: {
          'zh-CN': '默认语言',
          'en-US': 'Default Language',
        },
      },
      {
        group: 'i18n',
        name: 'locale.baseNavigator',
        type: 'boolean',
        default: true,
        title: '使用 navigator.language 作为默认语言',
        description: '如果为 true，使用 navigator.language 作为默认语言。',
      },
    ],
  },
  {
    configs: [
      {
        group: 'other',
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
    configs: [
      {
        group: 'other',
        name: 'fastClick',
        type: 'boolean',
        default: false,
        title: {
          'zh-CN': '开启 FastClick',
          'en-US': 'Enable FastClick',
        },
      },
      {
        group: 'other',
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
];
