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
  },
};
