var postcss = require('postcss');

// custom postcss plugin
module.exports = () => {
  return {
    postcssPlugin: 'postcss-test-plugin',
    Once (root, { result }) {
      root.walkRules((rule) => {
        rule.walkDecls(/^overflow-?/, (decl) => {
          console.log('decl.value ', decl.value);
          if (decl.value === 'scroll') {
            var hasTouch = rule.some((i) => {
              return i.prop === '-webkit-overflow-scrolling';
            });
            if (!hasTouch) {
              rule.append({
                prop: '-webkit-overflow-scrolling',
                value: 'touch'
              });
            }
          }
        });
      });
    }
  };
};
