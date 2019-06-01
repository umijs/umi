/* eslint-disable */
import address from 'address';
import url from 'url';
import chalk from 'chalk';

export default function prepareUrls(protocol, host, port, pathname, history) {

  // if history type is hash, add the base to hash part rather than pathname.
  const baseInfo = history === 'hash' ? {
    protocol,
    pathname: '/',
    hash: pathname || '',
  } : {
    protocol,
    pathname: pathname || '/',
  };

  const formatUrl = hostname =>
    url.format({
      ...baseInfo,
      hostname,
      port,
    });
  const prettyPrintUrl = hostname =>
    url.format({
      ...baseInfo,
      hostname,
      port: chalk.bold(port),
    });

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost, lanUrlForConfig, lanUrlForTerminal;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      // This can only return an IPv4 address
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (/^10[.]|^30[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined;
        }
      }
    } catch (_e) {
      // ignored
    }
  } else {
    prettyHost = host;
  }
  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  };
}
