import {
  logger,
  printHelp,
  setNoDeprecation,
  setNodeTitle,
  yParser,
} from '@umijs/utils';
import { DEV_COMMAND, FRAMEWORK_NAME } from '../constants';
import { Service } from '../service/service';
setNodeTitle(`${FRAMEWORK_NAME}-dev`);
setNoDeprecation();

(async () => {
  let closed = false;
  try {
    const args = yParser(process.argv.slice(2));
    const service = new Service();
    let startup: Promise<unknown>;
    let receivedSignal = false;
    const signalHandlers: Record<string, () => void> = {
      SIGINT: () => onSignal('SIGINT'),
      SIGQUIT: () => onSignal('SIGQUIT'),
      SIGTERM: () => onSignal('SIGTERM'),
    };

    for (const signal of ['SIGINT', 'SIGQUIT', 'SIGTERM']) {
      process.on(signal, signalHandlers[signal]);
    }
    process.on('message', (data: any) => {
      if (data?.type === 'SHUTDOWN') {
        shutdown(data.payload?.signal || 'SIGTERM');
      }
    });
    process.once('disconnect', () => shutdown('SIGTERM'));
    // IPC listeners must not keep commands such as `umi dev --help` alive.
    process.channel?.unref();

    function onSignal(signal: string) {
      receivedSignal = true;
      shutdown(signal);
    }

    async function shutdown(signal: string) {
      if (closed) return;
      closed = true;
      // The parent may already be gone, so it cannot enforce the timeout.
      const timer = setTimeout(() => process.exit(1), 5000);
      timer.unref();
      try {
        // Let startup finish registering hooks and creating resources first.
        await startup.catch(() => {});
        // IPC must also run existing signal cleanup. A real signal has already
        // invoked these listeners, so do not dispatch them again in that case.
        const cleanup = receivedSignal
          ? []
          : process
              .rawListeners(signal)
              .filter((listener) => listener !== signalHandlers[signal])
              // Raw listeners retain `once` wrappers; async captures throws.
              .map(async (listener) => listener.call(process, signal));
        cleanup.push(
          Promise.resolve().then(() =>
            service.applyPlugins({
              key: 'onExit',
              args: {
                signal,
              },
            }),
          ),
        );
        for (const result of await Promise.allSettled(cleanup)) {
          if (result.status === 'rejected') {
            process.exitCode = 1;
            logger.fatal(result.reason);
          }
        }
        process.exit(process.exitCode || 0);
      } catch (e: any) {
        logger.fatal(e);
        process.exit(1);
      } finally {
        clearTimeout(timer);
      }
    }

    startup = service.run2({
      name: DEV_COMMAND,
      args,
    });
    // The IPC channel may have closed before the listeners were installed.
    if (process.connected === false) shutdown('SIGTERM');
    await startup;
  } catch (e: any) {
    process.exitCode = 1;
    logger.fatal(e);
    printHelp.exit();
    if (!closed) process.exit(1);
  }
})();
