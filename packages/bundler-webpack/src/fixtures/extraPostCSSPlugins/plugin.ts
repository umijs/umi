var postcss = require('postcss');

// custom postcss plugin
module.exports = postcss.plugin('postcss-test-plugin', () => {
  return (root: any) => {
    root.walkRules((rule: any) => {
      rule.walkDecls(/^overflow-?/, (decl: any) => {
        console.log('decl.value ', decl.value);
        if (decl.value === 'scroll') {
          var hasTouch = rule.some((i: any) => {
            return i.prop === '-webkit-overflow-scrolling';
          });
          if (!hasTouch) {
            rule.append({
              prop: '-webkit-overflow-scrolling',
              value: 'touch',
            });
          }
        }
      });
    });
  };
});
