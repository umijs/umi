import assert from 'assert';
import page from './generators/page';

const generators = {
  page,
};

export default function(opts = {}) {
  const { type, file } = opts;
  assert(type, 'opts.type should be supplied');
  assert(typeof type === 'string', 'opts.file should be string');
  assert(file, 'opts.file should be supplied');
  assert(typeof file === 'string', 'opts.file should be string');
  assert(generators[type], `generator of type (${type}) not found`);

  delete opts.type;
  generators[type](opts);
}
