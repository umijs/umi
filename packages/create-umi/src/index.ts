import {
  BaseGenerator,
  installWithNpmClient,
  prompts,
  yParser,
} from '@umijs/utils';
import { join } from 'path';

const testData = {
  name: 'umi-plugin-demo',
  description: 'nothing',
  mail: 'xiaohuoni@gmail.com',
  author: 'xiaohuoni',
  org: 'umijs',
  version: require('../package').version,
  npmClient: 'pnpm',
  registry: 'https://registry.npmjs.org/',
};

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yParser.Arguments;
}) => {
  const [_, name] = args._;
  let npmClient = 'pnpm' as any;
  let registry = 'https://registry.npmjs.org/';
  // test ignore prompts
  if (!args.default) {
    const response = await prompts([
      {
        type: 'select',
        name: 'npmClient',
        message: 'Pick Npm Client',
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'cnpm', value: 'cnpm' },
          { title: 'tnpm', value: 'tnpm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'pnpm', value: 'pnpm' },
        ],
        initial: 4,
      },
      {
        type: 'select',
        name: 'registry',
        message: 'Pick Npm Registry',
        choices: [
          {
            title: 'npm',
            value: 'https://registry.npmjs.org/',
            selected: true,
          },
          { title: 'taobao', value: 'https://registry.npmmirror.com' },
        ],
      },
    ]);
    npmClient = response.npmClient;
    registry = response.registry;
  }

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
          npmClient,
          registry,
        },
    questions: args.default ? [] : args.plugin ? pluginPrompts : [],
  });
  await generator.run();

  if (!args.default) {
    // install
    installWithNpmClient({ npmClient });
  }
};
