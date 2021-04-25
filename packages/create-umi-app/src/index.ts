import { yargs } from '@umijs/utils';
import AppGenerator from './AppGenerator/AppGenerator';
import ExampleGenerator from './ExampleGenerator/ExampleGenerator';

const generators = {
  app: AppGenerator,
  example: ExampleGenerator,
};

export default async ({
  cwd,
  args,
}: {
  cwd: string;
  args: yargs.Arguments;
}) => {
  let generatorType = 'app';

  if (args.example) {
    generatorType = 'example';
  }

  if (args.example === true) {
    console.error(
      'Please provide an example name or url, otherwise remove the example option.',
    );
    process.exit(1);
    return;
  }

  const generator = new generators[generatorType]({
    cwd,
    args,
  });
  await generator.run();
};
