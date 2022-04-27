import { semver } from '@umijs/utils';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.modifyConfig((memo) => {
    // greater than range
    const isReact18GTR =
      api.pkg.dependencies?.react &&
      semver.gtr('18.0.0', api.pkg.dependencies.react);

    // compatible with < react@18 for @umijs/renderer-react
    if (isReact18GTR) {
      const reactDOM = memo.alias['react-dom'];

      memo.alias['react-dom/client'] = reactDOM;

      // put react-dom after react-dom/client
      delete memo.alias['react-dom'];
      memo.alias['react-dom'] = reactDOM;
    }

    return memo;
  });
};
