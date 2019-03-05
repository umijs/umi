
const noEmptyStr = { type: 'string', minLength: 1 };

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    entry: {
      oneOf: [
        noEmptyStr,
        { type: 'array', items: noEmptyStr },
      ],
    },
    file: { type: 'string' },
    esm: {
      oneOf: [
        { type: 'boolean' },
        { type: 'object',
          additionalProperties: false,
          properties: {
            type: {
              type: 'string',
              pattern: '^(rollup|babel)$',
            },
            file: { type: 'string' },
            mjs: { type: 'boolean' },
          },
        },
      ],
    },
    cjs: {
      oneOf: [
        { type: 'boolean' },
        { type: 'object',
          additionalProperties: false,
          properties: {
            type: {
              type: 'string',
              pattern: '^(rollup|babel)$',
            },
            file: { type: 'string' },
          },
        },
      ],
    },
    umd: {
      oneOf: [
        { type: 'boolean' },
        { type: 'object',
          additionalProperties: false,
          properties: {
            globals: { type: 'object' },
            file: { type: 'string' },
            name: { type: 'string' },
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
      oneOf: [
        { type: 'boolean' },
        { type: 'object' },
      ],
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
    doc: {
      type: 'object',
    },
  },
};
