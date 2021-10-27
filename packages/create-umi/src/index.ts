import { BaseGenerator, prompts, yParser } from '@umijs/utils';
import { join } from 'path';

const testData = {
  name: 'umi-plugin-demo',
  description: 'nothing',
  mail: 'xiaohuoni@gmail.com',
  author: 'xiaohuoni',
  org: 'umijs',
  version: '4.0.0-alpha.1',
};

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yParser.Arguments;
}) => {
  const [_, name] = args._;

  const pluginPrompts = [
    {
      name: 'name',
      type: 'text',
      message: `What's the plugin name?`,
      default: name,
    },
    {
      name: 'description',
      type: 'text',
      message: `What's your plugin used for?`,
    },
    {
      name: 'mail',
      type: 'text',
      message: `What's your email?`,
    },
    {
      name: 'author',
      type: 'text',
      message: `What's your name?`,
    },
    {
      name: 'org',
      type: 'text',
      message: `Which organization is your plugin stored under github?`,
    },
  ] as prompts.PromptObject[];

  const generator = new BaseGenerator({
    path: join(__dirname, '..', 'templates', args.plugin ? 'plugin' : 'app'),
    target: name ? join(cwd, name) : cwd,
    data: args.default
      ? testData
      : {
          version: require('../package').version,
        },
    questions: args.default ? [] : args.plugin ? pluginPrompts : [],
  });
  await generator.run();
};
