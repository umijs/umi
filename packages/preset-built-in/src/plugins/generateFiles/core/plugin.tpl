import { Plugin } from '{{{ runtimePath }}}';

const plugin = new Plugin({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
plugin.register({
  apply: require('{{{ . }}}'),
  path: '{{{ . }}}',
});
{{/plugins}}

export { plugin };
