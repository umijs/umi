import type { Root } from '@hapi/joi';
import { JSMinifier } from './types';

const options = [
  'cheap-source-map',
  'cheap-eval-source-map',
  'cheap-hidden-source-map',
  'cheap-inline-source-map',
  'cheap-module-source-map',
  'cheap-module-eval-source-map',
  'cheap-module-hidden-source-map',
  'cheap-module-inline-source-map',
  'eval',
  'eval-source-map',
  'source-map',
  'hidden-source-map',
  'inline-source-map',
];

const DEVTOOL_REGEX = new RegExp(
  '^' + // start of string
    '(#@|@|#)?' + // maybe one of the pragmas
    `(${options.join('$|')})`, // one of the options
);

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    alias: (Joi) => Joi.object(),
    define: (Joi) => Joi.object(),
    devtool: (Joi) =>
      Joi.alternatives().try(Joi.string().regex(DEVTOOL_REGEX), Joi.boolean()),
    externals: (Joi) =>
      Joi
        .alternatives()
        .try(
          Joi
            .object()
            .pattern(/.+/, [
              Joi.string(),
              Joi.boolean(),
              Joi.object().pattern(/.+/, [Joi.string(), Joi.boolean()]),
            ]),
          Joi.string(),
          Joi.func().arity(3),
          Joi.object().regex(),
        ),
    extraBabelPlugins: (Joi) =>
      Joi
        .alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.object())),
        ),
    extraBabelPresets: (Joi) =>
      Joi
        .alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.object())),
        ),
    extraPostCSSPlugins: (Joi) => Joi.array(),
    hash: (Joi) => Joi.boolean(),
    jsMinifier: (Joi) =>
      Joi
        .alternatives()
        .try(
          Joi
            .string()
            .valid(
              JSMinifier.esbuild,
              JSMinifier.terser,
            ),
          Joi.boolean(),
        ),
    jsMinifierOptions: (Joi) => Joi.object(),
    legacy: (Joi) =>
      Joi.alternatives().try(
        Joi.object(),
        Joi.boolean(),
      ),
    outputPath: (Joi) => Joi.string(),
    publicPath: (Joi) => Joi.string(),
    svgr: (Joi) => Joi.object(),
    targets: (Joi) =>
      Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.alternatives().try(Joi.string())),
      ),
  };
}
