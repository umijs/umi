import { ApplyPluginsType, PluginManager } from './plugin';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

test('event', async () => {
  const pm = new PluginManager({
    validKeys: ['foo'],
  });
  const ret = [];
  pm.register({
    apply: {
      foo: async () => {
        await delay(100);
        ret.push(2);
      },
    },
    path: '/a',
  });
  ret.push(1);
  await pm.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.event,
  });
  expect(ret).toEqual([1]);
});

test('event async', async () => {
  const pm = new PluginManager({
    validKeys: ['foo'],
  });
  const ret = [];
  pm.register({
    apply: {
      foo: async () => {
        await delay(100);
        ret.push(2);
      },
    },
    path: '/a',
  });
  ret.push(1);
  await pm.applyPlugins({
    key: 'foo',
    type: ApplyPluginsType.event,
    async: true,
  });
  expect(ret).toEqual([1, 2]);
});
