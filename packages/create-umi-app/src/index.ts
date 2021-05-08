import { yargs } from '@umijs/utils';
import download from 'load-examples';
import { join } from 'path';
import AppGenerator from './AppGenerator/AppGenerator';

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yargs.Arguments;
}) => {
  if (args.example) {
    const temp = {
      name: (args._[0] || args.example) as string,
      url: 'https://github.com/umijs/umi',
      path: join('examples', args.example + ''),
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
