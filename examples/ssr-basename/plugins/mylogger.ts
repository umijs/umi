import { writeFileSync } from 'fs';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'mylogger',
    config: {
      schema(joi) {
        return joi.string();
      },
    },
    enableBy: api.EnableBy.register,
  });

  api.registerMethod({
    name: 'mylogger',
    fn: (pathname, obj) => {
      let cache = [];
      const str = JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // 移除
            return;
          }
          // 收集所有的值
          cache.push(value);
        }
        return value;
      });
      cache = null;

      writeFileSync(pathname, str, () => {
        console.log('write log finish');
      });
    },
  });
};
