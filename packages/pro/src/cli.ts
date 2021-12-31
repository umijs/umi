import { run } from 'umi/dist/cli/cli';

run({
  presets: [require.resolve('./preset')],
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
