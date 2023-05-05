import { run } from 'umi';

export const start = async () => {
  run({
    presets: [require.resolve('./preset')],
  });
};
