import { IApi } from '../../types';

export default (api: IApi) => {
  api.addBeforeBabelPresets(() => {
    return [
      {
        plugins: [
          () => {
            return {};
          },
        ],
      },
    ];
  });
};
