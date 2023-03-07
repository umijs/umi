jest.useFakeTimers();

import { Telemetry } from './telemetry';

let t = new Telemetry();
let save = jest.fn();
beforeEach(() => {
  t = new Telemetry();
  save = jest.fn();
  t.useStorage({ save });
});

test('telemetry record sync', async () => {
  save.mockResolvedValue(null);

  t.record({ name: 'test', payload: { a: 1 } });

  expect(save).toBeCalledWith({ name: 'test', payload: { a: 1 } });
});

test('telemetry record sync failed will retry 2 time every 5s', async () => {
  save.mockRejectedValue(null);

  t.record({ name: 'test', payload: { a: 1 } });
  expect(save).toBeCalledTimes(1);

  await waitAllMicroTasks();
  await jest.runOnlyPendingTimers();
  expect(save).toBeCalledTimes(2);

  await waitAllMicroTasks();
  await jest.runOnlyPendingTimers();
  expect(save).toBeCalledTimes(3);
});

async function waitAllMicroTasks() {
  await jest.runAllTicks();
  await Promise.resolve();
}

test('telemetry record async save ok', async () => {
  save.mockResolvedValue(null);

  expect(await t.recordAsync({ name: 'test', payload: { a: 1 } })).toBe(true);
  expect(save).toBeCalledWith({ name: 'test', payload: { a: 1 } });
});

test('telemetry record async nook', async () => {
  save.mockRejectedValue(null);

  expect(await t.recordAsync({ name: 'test', payload: { a: 1 } })).toBe(false);

  expect(save).toBeCalledWith({ name: 'test', payload: { a: 1 } });
});

test('telemetry prefixWith', async () => {
  save.mockResolvedValue(null);

  const prefixed = t.prefixWith('prefix');

  await prefixed.recordAsync({ name: 'test', payload: { a: 1 } });

  expect(save).toBeCalledWith({ name: 'prefix:test', payload: { a: 1 } });
});
