import getHtmlGenerator from './getHtmlGenerator';
import chunksToMap from './build/chunksToMap';

export default service => {
  return class {
    apply(compiler) {
      compiler.hooks.emit.tap('generate-html-files', compilation => {
        const chunksMap = chunksToMap(compilation.chunks);
        const hg = getHtmlGenerator(service, {
          chunksMap,
        });
        try {
          hg.generate().forEach(({ filePath, content }) => {
            compilation.assets[filePath] = {
              source: () => content,
              size: () => content.length,
            };
          });
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    }
  };
};
