const path = require('path');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      return `module.exports = {
        __esModule: true,
        default: ${assetFilename},
        ReactComponent: ({ svgRef, ...props }) => ({
          $$typeof: Symbol.for('react.element'),
          type: 'svg',
          ref: svgRef || null,
          key: null,
          props: Object.assign({}, props, {
            children: ${assetFilename}
          })
        }),
      };`;
    }

    return `module.exports = ${assetFilename};`;
  },
};
