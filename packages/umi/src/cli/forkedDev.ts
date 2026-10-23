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
  let startupFailed = false;
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

    // kill(2) Ctrl-C
    process.on('SIGINT', signalHandlers.SIGINT);
    // kill(3) Ctrl-\
    process.on('SIGQUIT', signalHandlers.SIGQUIT);
    // kill(15) default
    process.on('SIGTERM', signalHandlers.SIGTERM);
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
        const cleanup: Promise<unknown>[] = [];
        // IPC must also run existing signal cleanup. A real signal has already
        // invoked these listeners, so do not dispatch them again in that case.
        if (!receivedSignal) {
          for (const listener of process.rawListeners(signal)) {
            if (listener === signalHandlers[signal]) continue;
            try {
              // Raw listeners retain the wrapper that removes `once` handlers.
              cleanup.push(Promise.resolve(listener.call(process, signal)));
            } catch (error) {
              cleanup.push(Promise.reject(error));
            }
          }
        }
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
        const results = await Promise.allSettled(cleanup);
        let cleanupFailed = false;
        for (const result of results) {
          if (result.status === 'rejected') {
            cleanupFailed = true;
            logger.fatal(result.reason);
          }
        }
        process.exit(
          startupFailed || cleanupFailed ? 1 : process.exitCode || 0,
        );
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
    startupFailed = true;
    logger.fatal(e);
    printHelp.exit();
    if (!closed) process.exit(1);
  }
})();
