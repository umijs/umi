/* eslint-disable */
import address from 'address';
import url from 'url';
import chalk from 'chalk';

export default function prepareUrls(protocol, host, port, base, history) {
  const baseInfo = {
    protocol,
    pathname: base || '/',
  };

  const formatUrl = hostname =>
    url.format({
      ...baseInfo,
      hostname,
      port,
    });
  const prettyPrintUrl = (hostname, useColor) =>
    url.format({
      ...baseInfo,
      hostname,
      port: useColor ? chalk.bold(port) : port,
    });

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost, lanUrlForConfig, lanUrlForTerminal, rawLanUrl;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      // This can only return an IPv4 address
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        // check if use public ip
        const USE_PUBLIC_IP = process.env.USE_PUBLIC_IP === 'true';
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (
          USE_PUBLIC_IP ||
          /^10[.]|^30[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)
        ) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig, true);
          rawLanUrl = prettyPrintUrl(lanUrlForConfig, false);
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
    rawLanUrl,
  };
}
