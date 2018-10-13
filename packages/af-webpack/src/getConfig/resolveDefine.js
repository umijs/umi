const prefixRE = /^UMI_APP_/;

export default function(opts) {
  const env = {};
  Object.keys(process.env).forEach(key => {
    if (
      prefixRE.test(key) ||
      key === 'NODE_ENV' ||
      key === 'HMR' ||
      key === 'SOCKET_SERVER'
    ) {
      env[key] = process.env[key];
    }
  });

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  const define = {};
  if (opts.define) {
    for (const key in opts.define) {
      define[key] = JSON.stringify(opts.define[key]);
    }
  }

  return {
    'process.env': env,
    ...define,
  };
}
