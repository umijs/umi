import Service from './Service';

export default function dev(opts = {}) {
  const service = new Service(opts.cwd, opts);
  return service.dev();
}
