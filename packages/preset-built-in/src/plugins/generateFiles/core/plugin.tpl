import { Plugin } from '{{{ runtimePath }}}';
{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}

const plugin = new Plugin({
  validKeys: [{{#validKeys}}'{{{ . }}}',{{/validKeys}}],
});
{{#plugins}}
plugin.register({
  apply: Plugin_{{{ index }}},
  path: '{{{ path }}}',
});
{{/plugins}}

export { plugin };
