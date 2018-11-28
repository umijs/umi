import {
  dependenciesConflictCheck,
  getNameFromPkg,
  parseContentToSingular,
  getSingularName,
} from './block';

describe('test block generate', () => {
  it('dependenciesConflictCheck', () => {
    const { conflicts, lacks } = dependenciesConflictCheck(
      {
        react: '>=16.0.0',
        antd: '^3.0.0',
        moment: '^2.3.0',
      },
      {
        react: '^16.1.0',
        moment: '2.1.0',
      },
    );
    expect(conflicts).toEqual([['moment', '^2.3.0', '2.1.0']]);
    expect(lacks).toEqual([['antd', '^3.0.0']]);
  });

  it('getNameFromPkg', () => {
    expect(
      getNameFromPkg({
        desc: 'test no name',
      }),
    ).toEqual(null);
    expect(
      getNameFromPkg({
        name: 'test-demo',
      }),
    ).toEqual('test-demo');
    expect(
      getNameFromPkg({
        name: '@umi-blocks/demo',
      }),
    ).toEqual('demo');
  });

  it('parseContentToSingular', () => {
    expect(
      parseContentToSingular(`
import test from '@/utils/test';
import '@/models/global';
import '@/components/CompTest/index.js';
import "@/locales/zh_CN";
import { api } from '@/services/yes';
import { ok } from '@/page/ttt';
import test2 from '@/goos/test';
import types from '@types/yes';

// test comment
export default() {
  return <div>test</div>;
};
`),
    ).toEqual(`
import test from '@/util/test';
import '@/model/global';
import '@/component/CompTest/index.js';
import "@/locale/zh_CN";
import { api } from '@/service/yes';
import { ok } from '@/page/ttt';
import test2 from '@/goos/test';
import types from '@types/yes';

// test comment
export default() {
  return <div>test</div>;
};
`);
  });

  it('getSingularName', () => {
    expect(getSingularName('locales')).toEqual('locale');
    expect(getSingularName('test.js')).toEqual('test.js');
    expect(getSingularName('components')).toEqual('component');
    expect(getSingularName('.components')).toEqual('.components');
    expect(getSingularName('test-tests')).toEqual('test-tests');
  });
});
