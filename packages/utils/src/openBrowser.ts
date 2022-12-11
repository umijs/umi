/**
 * The following is modified based on source found in
 * https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/openBrowser.js
 */

import chalk from '../compiled/chalk';
import { execSync } from 'child_process';
import spawn from '../compiled/cross-spawn';
import open, { type Options as OpenOptions } from '../compiled/open';

function executeNodeScript(scriptPath: string, url: string) {
  const extraArgs = process.argv.slice(2);
  const child = spawn(process.execPath, [scriptPath, ...extraArgs, url], {
    stdio: 'inherit',
  });
  child.on('close', (code) => {
    if (code !== 0) {
      console.log();
      console.log(
        chalk.red(
          'The script specified as BROWSER environment variable failed.',
        ),
      );
      console.log(chalk.cyan(scriptPath) + ' exited with code ' + code + '.');
      console.log();
      return;
    }
  });
  return true;
}

function startBrowserProcess(browser: string | undefined, url: string) {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === 'google chrome');

  if (shouldTryOpenChromiumWithAppleScript) {
    // Will use the first open browser found from list
    const supportedChromiumBrowsers = [
      'Google Chrome Canary',
      'Google Chrome Dev',
      'Google Chrome Beta',
      'Google Chrome',
      'Microsoft Edge',
      'Brave Browser',
      'Vivaldi',
      'Chromium',
    ];

    for (let chromiumBrowser of supportedChromiumBrowsers) {
      try {
        // Try our best to reuse existing tab
        // on OSX Chromium-based browser with AppleScript
        execSync('ps cax | grep "' + chromiumBrowser + '"');
        execSync(
          'osascript openChrome.applescript "' +
            encodeURI(url) +
            '" "' +
            chromiumBrowser +
            '"',
          {
            cwd: __dirname,
            stdio: 'ignore',
          },
        );
        return true;
      } catch (err) {
        // Ignore errors.
      }
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing `open` to `opn` (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
  // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined;
  }

  // Fallback to open
  // (It will always open new tab)
  try {
    open(url, { app: browser, wait: false, url: true } as OpenOptions).catch(
      () => {},
    ); // Prevent `unhandledRejection` error.
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reads the BROWSER environment variable and decides what to do with it. Returns
 * true if it opened a browser or ran a node.js script, otherwise false.
 */
export function openBrowser(url: string) {
  // The browser executable to open.
  // See https://github.com/sindresorhus/open#app for documentation.
  const browser = process.env.BROWSER || '';
  if (browser.toLowerCase().endsWith('.js')) {
    return executeNodeScript(browser, url);
  } else if (browser.toLowerCase() !== 'none') {
    return startBrowserProcess(browser, url);
  }
  return false;
}
