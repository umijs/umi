import {
  ApplyPluginsType,
  PluginManager,
} from 'umi/client/client/plugin';

class Counter {
  #value = 1;

  increment() {
    return ++this.#value;
  }
}

async function* values() {
  yield await Promise.resolve(new Counter().increment());
}

async function run() {
  const results = [];
  for await (const value of values()) results.push(value);

  const manager = new PluginManager({ validKeys: ['answer'] });
  manager.register({
    apply: { answer: async (value: number) => value + 1 },
  });
  results.push(
    await manager.applyPlugins({
      key: 'answer',
      type: ApplyPluginsType.modify,
      initialValue: results[0],
      async: true,
    }),
  );
  return results;
}

(globalThis as any).__runtime8Result = run();
