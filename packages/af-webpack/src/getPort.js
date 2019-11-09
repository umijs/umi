import portfinder from 'portfinder';

export default async port => {
  if (port) {
    return port;
  }
  if (process.env.PORT) {
    return parseInt(process.env.PORT, 10);
  }

  portfinder.basePort = parseInt(process.env.BASE_PORT) || 8000;
  portfinder.highestPort = portfinder.basePort + 1000;

  return portfinder.getPortPromise();
};
