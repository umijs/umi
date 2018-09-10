import assert from 'assert';
import optionsSchema from 'webpack-dev-server/lib/optionsSchema.json';
import OptionsValidationError from 'webpack-dev-server/lib/OptionsValidationError';
import webpack from 'webpack';

export default function() {
  return {
    name: 'devServer',
    validate(val) {
      const validationErrors = webpack.validateSchema(optionsSchema, val);
      assert(
        validationErrors.length === 0,
        validationErrors
          .map(err => OptionsValidationError.formatValidationError(err))
          .join('\n'),
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config devServer Changed');
    },
  };
}
