import os from 'os';

import cacache from '@umijs/deps/compiled/cacache';
import findCacheDir from '@umijs/deps/compiled/find-cache-dir';
import serialize from '@umijs/deps/compiled/serialize-javascript';

export default class Webpack4Cache {
  constructor(compilation, options, weakCache) {
    this.cache =
      options.cache === true
        ? Webpack4Cache.getCacheDirectory()
        : options.cache;
    this.weakCache = weakCache;
  }

  static getCacheDirectory() {
    return findCacheDir({ name: 'terser-webpack-plugin' }) || os.tmpdir();
  }

  async get(cacheData, { RawSource, ConcatSource, SourceMapSource }) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    const weakOutput = this.weakCache.get(cacheData.inputSource);

    if (weakOutput) {
      return weakOutput;
    }

    // eslint-disable-next-line no-param-reassign
    cacheData.cacheIdent =
      cacheData.cacheIdent || serialize(cacheData.cacheKeys);

    let cachedResult;

    try {
      cachedResult = await cacache.get(this.cache, cacheData.cacheIdent);
    } catch (ignoreError) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    cachedResult = JSON.parse(cachedResult.data);

    if (cachedResult.target === 'comments') {
      return new ConcatSource(cachedResult.value);
    }

    const {
      code,
      name,
      map,
      input,
      inputSourceMap,
      extractedComments,
      banner,
      shebang,
    } = cachedResult;

    if (map) {
      cachedResult.source = new SourceMapSource(
        code,
        name,
        map,
        input,
        inputSourceMap,
        true,
      );
    } else {
      cachedResult.source = new RawSource(code);
    }

    if (banner) {
      cachedResult.source = new ConcatSource(
        shebang ? `${shebang}\n` : '',
        `/*! ${banner} */\n`,
        cachedResult.source,
      );
    }

    if (extractedComments) {
      cachedResult.extractedCommentsSource = new RawSource(extractedComments);
    }

    return cachedResult;
  }

  async store(cacheData) {
    if (!this.cache) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    if (!this.weakCache.has(cacheData.inputSource)) {
      if (cacheData.target === 'comments') {
        this.weakCache.set(cacheData.inputSource, cacheData.output);
      } else {
        this.weakCache.set(cacheData.inputSource, cacheData);
      }
    }

    let data;

    if (cacheData.target === 'comments') {
      data = {
        target: cacheData.target,
        value: cacheData.output.source(),
      };
    } else {
      data = {
        code: cacheData.code,
        name: cacheData.name,
        map: cacheData.map,
        input: cacheData.input,
        inputSourceMap: cacheData.inputSourceMap,
        banner: cacheData.banner,
        shebang: cacheData.shebang,
      };

      if (cacheData.extractedCommentsSource) {
        data.extractedComments = cacheData.extractedCommentsSource.source();
        data.commentsFilename = cacheData.commentsFilename;
      }
    }

    return cacache.put(this.cache, cacheData.cacheIdent, JSON.stringify(data));
  }
}
