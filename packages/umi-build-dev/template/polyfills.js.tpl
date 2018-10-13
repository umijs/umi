import '@babel/polyfill';

{{#url}}
// Include this seperatly since it's not included in core-js
// ref: https://github.com/zloirock/core-js/issues/117
import '{{{ url_polyfill_path }}}';
{{/url}}
