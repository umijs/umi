import { Plugin } from 'umi';

const plugin = new Plugin({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
plugin.register(require('{{{ . }}}'));
{{/plugins}}

export { plugin };
