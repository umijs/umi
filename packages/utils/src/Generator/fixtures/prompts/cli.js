#!/usr/bin/env node
const { yParser } = require('@umijs/utils');
const { Generator } = require('../../../../lib');

(async () => {
  const args = yParser(process.argv.slice(2));
  const target = args._[0]
  const templatePath = args._[1]
  class PromptsGenerator extends Generator {

    prompting() {
      return [{
        type: 'text',
        name: 'name',
        message: 'What is your project named?',
        initial: 'my-app',
      }];
    }

    async writing() {
      if (this.prompts.name === 'a') {
        this.copyTpl({
          context: {
            foo: 'bar',
          },
          target: this.args.target,
          templatePath: this.args.templatePath,
        });
      }
    }
  }

  const g = new PromptsGenerator({
    args: {
      target,
      templatePath
    },
    cwd: __dirname
  });

  await g.run();
  process.exit(0);
})();
