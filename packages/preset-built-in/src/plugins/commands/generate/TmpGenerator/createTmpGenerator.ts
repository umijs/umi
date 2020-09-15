import { IApi } from '@umijs/types';
import { Generator } from '@umijs/utils';
import generateFiles from '../../generateFiles';

export default ({ api }: { api: IApi }) => {
  return class TmpGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }

    async writing() {
      await generateFiles({
        api,
      });
    }
  };
};
