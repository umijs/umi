import Service from './Service';

export default function build(opts = {}) {
  const service = new Service(opts.cwd, opts);
  return service.build();
}
