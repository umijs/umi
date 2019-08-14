import assert from 'assert';
import { isPlainObject } from 'lodash';

export default function(api) {
  return {
    name: 'exportStatic',
    validate(val) {
      assert(
        isPlainObject(val) || typeof val === 'boolean',
        `Configure item context should be Plain Object, but got ${val}.`,
      );
    },
    onChange() {
      api.service.restart(/* why */ 'Config exportStatic Changed');
    },
    configs: [
      {
        group: 'basic',
        name: 'exportStatic.htmlSuffix',
        title: {
          'zh-CN': '启用 .html 后缀',
          'en-US': 'Enable .html Suffix',
        },
        type: 'boolean',
        default: false,
      },
      {
        group: 'basic',
        name: 'exportStatic.dynamicRoot',
        type: 'boolean',
        default: false,
      },
    ],
  };
}
