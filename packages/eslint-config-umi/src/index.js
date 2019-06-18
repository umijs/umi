import reactAppConfig from 'eslint-config-react-app';

export default {
  ...reactAppConfig,
  rules: {
    ...reactAppConfig.rules,
    strict: [0],
    'no-sequences': [0],
    'no-mixed-operators': [0],
    'react/react-in-jsx-scope': [0],
    'no-useless-escape': [0],
  },
  settings: {
    react: {
      version: '16.8',
    },
  },
};
