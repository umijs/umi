import { ChildProcess, fork } from 'child_process';
import { createServer } from 'net';
import { join } from 'path';

interface WorkerReady {
  type: 'FIXTURE_READY';
  pid: number;
  port: number;
  args: string[];
  execArgv: string[];
  mock: string;
  marker: string;
}

function isRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ESRCH') return false;
    throw error;
  }
}

async function waitFor(
  condition: () => boolean,
  description: () => string,
  timeout = 5000,
) {
  const deadline = Date.now() + timeout;
  while (!condition()) {
    if (Date.now() >= deadline) throw new Error(description());
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }
}

function exited(child: ChildProcess) {
  return child.exitCode !== null || child.signalCode !== null;
}

async function expectPortAvailable(port: number) {
  const server = createServer();
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  } finally {
    if (server.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  }
}

// Windows does not support delivering these POSIX signals to a single PID.
const describePosix = process.platform === 'win32' ? describe.skip : describe;

describePosix('dev process lifecycle', () => {
  test.each(['delay', 'ignore'] as const)(
    'waits for a worker with %s shutdown behavior before exiting',
    async (shutdown) => {
      const workerPids: number[] = [];
      const ready: WorkerReady[] = [];
      const workerExits: any[] = [];
      let workersAtParentExit: number[] | undefined;
      let output = '';
      const parent = fork(
        join(__dirname, 'fixtures/dev-process-parent.js'),
        ['dev'],
        {
          execArgv: ['--require', require.resolve('tsx/cjs')],
          env: {
            ...process.env,
            PORT: '0',
            UMI_DEV_TEST_SHUTDOWN: shutdown,
          },
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        },
      );
      parent.stdout!.on('data', (data) => (output += data));
      parent.stderr!.on('data', (data) => (output += data));
      parent.on('message', (message: any) => {
        if (message.type === 'FIXTURE_SPAWN') workerPids.push(message.pid);
        if (message.type === 'FIXTURE_READY') ready.push(message);
        if (message.type === 'FIXTURE_WORKER_EXIT') workerExits.push(message);
      });
      parent.once('exit', () => {
        // Capture this immediately: waiting for the worker afterwards would
        // hide the supervisor exiting before it has finished stopping it.
        workersAtParentExit = workerPids.filter(isRunning);
      });

      try {
        await waitFor(
          () => ready.length === 1,
          () => `Initial worker did not start: ${output}`,
        );
        parent.kill('SIGTERM');
        await waitFor(
          () => exited(parent),
          () => `Supervisor did not stop the ${shutdown} worker: ${output}`,
          8000,
        );
        expect(parent.exitCode).toBe(1);
        expect(workersAtParentExit).toEqual([]);
        expect(workerExits).toEqual([
          {
            type: 'FIXTURE_WORKER_EXIT',
            pid: ready[0].pid,
            code: shutdown === 'delay' ? 0 : null,
            signal: shutdown === 'ignore' ? 'SIGKILL' : null,
          },
        ]);
        await expectPortAvailable(ready[0].port);
      } finally {
        if (!exited(parent)) {
          parent.kill('SIGKILL');
          await waitFor(
            () => exited(parent),
            () => 'Could not clean up fixture supervisor',
          );
        }
        for (const pid of workerPids) {
          if (isRunning(pid)) process.kill(pid, 'SIGKILL');
        }
        await waitFor(
          () => workerPids.every((pid) => !isRunning(pid)),
          () => 'Could not clean up fixture workers',
        );
      }
    },
    20000,
  );

  test.each([
    { signal: 'SIGINT', restarts: 0, exitCode: 0 },
    { signal: 'SIGINT', restarts: 1, exitCode: 0 },
    { signal: 'SIGINT', restarts: 2, exitCode: 0 },
    { signal: 'SIGTERM', restarts: 0, exitCode: 1 },
    { signal: 'SIGTERM', restarts: 1, exitCode: 1 },
    { signal: 'SIGTERM', restarts: 2, exitCode: 1 },
  ] as const)(
    'stops every worker on $signal after $restarts restarts',
    async ({ signal, restarts, exitCode }) => {
      const args = ['dev', '--port', '0'];
      const execArgv = [
        '--require',
        require.resolve('tsx/cjs'),
        '--no-warnings',
      ];
      const workerPids: number[] = [];
      const ready: WorkerReady[] = [];
      const messages: any[] = [];
      let output = '';
      const parent = fork(
        join(__dirname, 'fixtures/dev-process-parent.js'),
        args,
        {
          execArgv,
          env: {
            ...process.env,
            PORT: '0',
            MOCK: 'none',
            UMI_DEV_TEST_MARKER: 'inherited-by-restarted-workers',
          },
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        },
      );
      parent.stdout!.on('data', (data) => (output += data));
      parent.stderr!.on('data', (data) => (output += data));
      parent.on('message', (message: any) => {
        messages.push(message);
        if (message.type === 'FIXTURE_SPAWN') workerPids.push(message.pid);
        if (message.type === 'FIXTURE_READY') ready.push(message);
      });

      try {
        await waitFor(
          () => ready.length === 1,
          () => `Initial worker did not start: ${output}`,
        );
        for (let i = 0; i < restarts; i++) {
          parent.send({ type: 'FIXTURE_RESTART' });
          await waitFor(
            () => ready.length === i + 2,
            () => `Restart ${i + 1} did not start a worker: ${output}`,
          );
        }

        expect(workerPids).toHaveLength(restarts + 1);
        for (const worker of ready) {
          expect(worker).toMatchObject({
            args,
            execArgv,
            mock: 'none',
            marker: 'inherited-by-restarted-workers',
            port: ready[0].port,
          });
        }
        expect(messages.filter(({ type }) => type === 'RESTART')).toHaveLength(
          restarts,
        );
        const forwardedMessage = {
          type: 'CUSTOM_WORKER_MESSAGE',
          payload: { value: 'forwarded unchanged' },
        };
        parent.send(forwardedMessage);
        await waitFor(
          () => messages.some(({ type }) => type === forwardedMessage.type),
          () => `Worker IPC was not forwarded: ${output}`,
        );
        expect(messages).toContainEqual(forwardedMessage);

        // Signal only the supervisor PID: terminal process-group signals would
        // mask a stale worker reference by killing the worker independently.
        parent.kill(signal);
        await waitFor(
          () => exited(parent),
          () => `Supervisor did not exit after ${signal}: ${output}`,
        );
        expect(parent.exitCode).toBe(exitCode);
        await waitFor(
          () => workerPids.every((pid) => !isRunning(pid)),
          () =>
            `Workers survived supervisor exit: ${workerPids.filter(isRunning)}`,
        );
        await expectPortAvailable(ready[0].port);
      } finally {
        // Include every spawned PID, even if a worker failed before readiness.
        if (!exited(parent)) {
          parent.kill('SIGKILL');
          await waitFor(
            () => exited(parent),
            () => 'Could not clean up fixture supervisor',
          );
        }
        for (const pid of workerPids) {
          if (isRunning(pid)) process.kill(pid, 'SIGKILL');
        }
        await waitFor(
          () => workerPids.every((pid) => !isRunning(pid)),
          () => 'Could not clean up fixture workers',
        );
      }
    },
    20000,
  );
});
