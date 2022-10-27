import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'tsconfig',
    config: {
      schema(Joi) {
        return Joi.object().keys({
          overrides: Joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });
};
