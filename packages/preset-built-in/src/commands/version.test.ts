import { Env, Service } from '@umijs/core';

test('version command', async () => {
  const v = await new Service({
    cwd: __dirname,
    plugins: [require.resolve('./version')],
    env: Env.test,
  }).run({
    name: 'version',
    args: { quiet: true },
  });
  console.log(v);
});
