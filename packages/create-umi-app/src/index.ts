import { yargs } from '@umijs/utils';
import AppGenerator from './AppGenerator/AppGenerator';
import download from './utils/download';
import { hasExample } from './utils/examples';

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yargs.Arguments;
}) => {
  if (args.example) {
    const has = await hasExample(`${args.example}`);
    if (!has) {
      throw new Error(`umi example: ${args.example} is no found`);
    }
    const temp = {
      name: (args._[0] || args.example) as string,
      url: 'https://github.com/umijs/umi',
      path: `examples/${args.example}`,
    };
    const pkg = await download(cwd, temp);
    return;
  }
  const generator = new AppGenerator({
    cwd,
    args,
  });
  await generator.run();
};
