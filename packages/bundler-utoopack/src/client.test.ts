import fs from 'fs';
import path from 'path';
import { runInNewContext } from 'vm';

const source = fs
  .readFileSync(path.join(__dirname, '../client/client/client.js'), 'utf8')
  .replace('export const ready', 'const ready');

function createClient(errorOverlay = true, hasBody = true) {
  const nodes: any[] = [];
  const listeners: Record<string, Function> = {};
  const reload = jest.fn();
  const fetch = jest.fn().mockResolvedValue({});
  const appendChild = (node: any) => nodes.push(node);
  const document = {
    body: hasBody ? { appendChild } : null,
    documentElement: { appendChild },
    createElement: (tag: string) => {
      const node = {
        tag,
        style: {},
        attributes: {} as Record<string, string>,
        setAttribute(name: string, value: string) {
          this.attributes[name] = value;
        },
        remove: () => nodes.splice(nodes.indexOf(node), 1),
        contentDocument: { open() {}, write() {}, close() {} },
      };
      return node;
    },
  };
  const WebSocket = jest.fn().mockImplementation(() => ({
    addEventListener: (type: string, listener: Function) => {
      listeners[type] = listener;
    },
  }));
  const ready: Promise<void> = runInNewContext(`${source}\nready;`, {
    document,
    WebSocket,
    window: { location: { reload }, addEventListener() {} },
    location: { protocol: 'http:', host: 'localhost:8000' },
    process: { env: { ERROR_OVERLAY: errorOverlay ? '' : 'none' } },
    console: { log() {}, info() {}, warn() {}, error() {} },
    setTimeout,
    clearTimeout,
    fetch,
  });
  return {
    ready,
    reload,
    fetch,
    WebSocket,
    nodes,
    indicator: () =>
      nodes.find((node) => 'data-utoopack-compiling' in node.attributes),
    message: (action: string, payload = {}) =>
      listeners.message({ data: JSON.stringify({ action, ...payload }) }),
    event: (type: string) => listeners[type](),
  };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('waits for initial sync before allowing lazy imports, using one socket', async () => {
  const client = createClient();
  const start = jest.fn();
  client.ready.then(start);
  await Promise.resolve();
  expect(start).not.toHaveBeenCalled();
  client.message('turbopack-connected');
  jest.advanceTimersByTime(2000);
  await Promise.resolve();
  expect(start).not.toHaveBeenCalled();
  client.message('sync');
  await client.ready;
  expect(start).toHaveBeenCalledTimes(1);
  expect(client.WebSocket).toHaveBeenCalledTimes(1);
  expect(client.indicator()).toBeUndefined();
});

test('does not block application startup if the socket never connects', async () => {
  const client = createClient();
  jest.advanceTimersByTime(1000);
  await expect(client.ready).resolves.toBeUndefined();
  expect(client.indicator()).toBeUndefined();
  expect(client.reload).not.toHaveBeenCalled();
});

test('shows one non-blocking status for repeated building messages and removes it on built', () => {
  const client = createClient();
  client.message('building');
  jest.advanceTimersByTime(100);
  client.message('building');
  jest.advanceTimersByTime(50);
  expect(client.indicator().textContent).toBe('Utoopack is compiling...');
  expect(client.indicator().attributes.role).toBe('status');
  expect(client.indicator().style.cssText).toContain('pointer-events: none');
  client.message('building');
  jest.advanceTimersByTime(500);
  expect(client.nodes).toHaveLength(1);
  client.message('built');
  expect(client.nodes).toHaveLength(0);
  expect(client.reload).not.toHaveBeenCalled();
});

test('does not flash for a quick compilation', () => {
  const client = createClient();
  client.message('building');
  jest.advanceTimersByTime(100);
  client.message('built');
  jest.advanceTimersByTime(200);
  expect(client.indicator()).toBeUndefined();
});

test.each(['sync', 'built', 'reload'])(
  '%s clears pending and visible status',
  (action) => {
    const client = createClient();
    client.message('building');
    client.message(action);
    jest.advanceTimersByTime(200);
    expect(client.indicator()).toBeUndefined();
    client.message('building');
    jest.advanceTimersByTime(200);
    client.message(action);
    expect(client.indicator()).toBeUndefined();
  },
);

test('compile errors replace the status with the existing overlay and recover once', () => {
  const client = createClient();
  client.message('building');
  jest.advanceTimersByTime(200);
  client.message('built', { errors: [{ message: 'Compile failed' }] });
  expect(client.indicator()).toBeUndefined();
  expect(client.nodes.map((node) => node.tag)).toEqual(['iframe']);
  client.message('building');
  client.message('built');
  client.message('built');
  jest.advanceTimersByTime(200);
  expect(client.nodes).toHaveLength(0);
  expect(client.reload).toHaveBeenCalledTimes(1);
});

test('keeps compilation status when the error overlay is disabled', () => {
  const client = createClient(false);
  client.message('building');
  jest.advanceTimersByTime(200);
  expect(client.indicator()).toBeDefined();
  client.message('built', { errors: ['Compile failed'] });
  expect(client.nodes).toHaveLength(0);
});

test.each(['close', 'error'])(
  '%s clears status and releases startup without a reload before connection',
  async (event) => {
    const client = createClient();
    client.message('building');
    jest.advanceTimersByTime(200);
    await client.event(event);
    await client.ready;
    expect(client.indicator()).toBeUndefined();
    expect(client.reload).not.toHaveBeenCalled();
    expect(client.fetch).not.toHaveBeenCalled();
  },
);

test('disconnect clears the pending indicator and retains server restart recovery', async () => {
  const client = createClient();
  client.message('turbopack-connected');
  client.message('building');
  await client.event('close');
  await expect(client.ready).resolves.toBeUndefined();
  jest.advanceTimersByTime(200);
  expect(client.indicator()).toBeUndefined();
  expect(client.reload).toHaveBeenCalledTimes(1);
  expect(client.fetch).toHaveBeenCalledWith('http://localhost:8000/__umi_ping');
});

test('can display status before the body exists', () => {
  const client = createClient(true, false);
  client.message('building');
  jest.advanceTimersByTime(200);
  expect(client.indicator()).toBeDefined();
});
