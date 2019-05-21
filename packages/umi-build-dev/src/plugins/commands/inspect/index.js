export default function(api) {
  const { service } = api;

  api.registerCommand(
    'inspect',
    {
      webpack: true,
      description: 'inspect internal webpack config',
      usage: 'umi inspect [options]',
      options: {
        '--mode': 'specify env mode (development or production, default is development)',
        '--rule <ruleName>': 'inspect a specific module rule',
        '--plugin <pluginName>': 'inspect a specific plugin',
        '--rules': 'list all module rule names',
        '--plugins': 'list all plugin names',
        '--verbose': 'show full function definitions in output',
      },
    },
    (args = {}) => {
      const { verbose } = args;
      const webpackChain = require('af-webpack/webpack-chain');
      const config = service.webpackConfig;

      let res;
      if (args.rule) {
        res = config.module.rules.find(r => r.__ruleNames[0] === args.rule);
      } else if (args.plugin) {
        res = config.plugins.find(p => p.__pluginName === args.plugin);
      } else if (args.rules) {
        res = config.module.rules.map(r => r.__ruleNames[0]);
      } else if (args.plugins) {
        res = config.plugins.map(p => p.__pluginName || p.constructor.name);
      } else {
        res = config;
      }

      const output = webpackChain.toString(res, { verbose });
      console.log(output);
    },
  );
}
