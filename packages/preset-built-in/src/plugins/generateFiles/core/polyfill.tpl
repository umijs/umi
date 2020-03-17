{{#coreJs}}
import '{{{ coreJs }}}';
{{/coreJs}}
{{^coreJs}}
{{#imports}}
import '{{{ . }}}';
{{/imports}}
{{/coreJs}}
import 'regenerator-runtime/runtime';
