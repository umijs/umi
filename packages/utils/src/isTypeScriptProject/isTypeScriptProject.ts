import { IApi } from '@umijs/types';
import { extname } from 'path';

export default function (api: IApi) {
  return (
    extname(api.service.configInstance.configFile || '').indexOf('ts') !== -1
  );
}
