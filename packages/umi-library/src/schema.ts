const noEmptyStr = { type: 'string', minLength: 1 };

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    entry: {
      oneOf: [noEmptyStr, { type: 'array', items: noEmptyStr }],
    },
    file: { type: 'string' },
    esm: {
      oneOf: [
        noEmptyStr,
        { type: 'boolean' },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            type: {
              type: 'string',
              pattern: '^(rollup|babel)$',
            },
            file: noEmptyStr,
            mjs: { type: 'boolean' },
            minify: { type: 'boolean' },
          },
        },
      ],
    },
    cjs: {
      oneOf: [
        noEmptyStr,
        { type: 'boolean' },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            type: {
              type: 'string',
              pattern: '^(rollup|babel)$',
            },
            file: noEmptyStr,
            minify: { type: 'boolean' },
          },
        },
      ],
    },
    umd: {
      oneOf: [
        { type: 'boolean' },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            globals: { type: 'object' },
            file: noEmptyStr,
            name: noEmptyStr,
            minFile: { type: 'boolean' },
          },
        },
      ],
    },
    extraBabelPlugins: {
      type: 'array',
    },
    extraBabelPresets: {
      type: 'array',
    },
    extraPostCSSPlugins: {
      type: 'array',
    },
    cssModules: {
      oneOf: [{ type: 'boolean' }, { type: 'object' }],
    },
    autoprefixer: {
      type: 'object',
    },
    namedExports: {
      type: 'object',
    },
    runtimeHelpers: {
      type: 'boolean',
    },
    overridesByEntry: {
      type: 'object',
    },
    target: noEmptyStr,
    doc: {
      type: 'object',
    },
    replace: {
      type: 'object',
    },
    typescript: {
      properties: {
        include: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        exclude: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } },
          ],
        },
        check: { type: 'boolean' },
        verbosity: { type: 'number' },
        clean: { type: 'boolean' },
        cacheRoot: { type: 'string' },
        abortOnError: { type: 'boolean' },
        rollupCommonJSResolveHack: { type: 'boolean' },
        tsconfig: { type: 'string' },
        useTsconfigDeclarationDir: { type: 'boolean' },
        transformers: { type: 'array' },
        objectHashIgnoreUnknownHack: { type: 'boolean' },
      },
    },
  },
};
