import { join } from 'path';
import {
  dependenciesConflictCheck,
  getNameFromPkg,
  parseContentToSingular,
  getSingularName,
  getMockDependencies,
  getAllBlockDependencies,
} from './getBlockGenerator';

describe('test block generate', () => {
  it('dependenciesConflictCheck', () => {
    const { conflicts, lacks, devConflicts, devLacks } = dependenciesConflictCheck(
      {
        react: '>=16.0.0',
        antd: '^3.0.0',
        moment: '^2.3.0',
      },
      {
        react: '^16.1.0',
        moment: '2.1.0',
      },
      {
        qs: '^4.3.0',
        mockjs: '~0.0.1',
      },
      {
        react: '^16.1.0',
        moment: '2.1.0',
        mockjs: '^1.1.0-beta3',
      },
    );
    expect(conflicts).toEqual([['moment', '^2.3.0', '2.1.0']]);
    expect(lacks).toEqual([['antd', '^3.0.0']]);
    expect(devConflicts).toEqual([['mockjs', '~0.0.1', '^1.1.0-beta3']]);
    expect(devLacks).toEqual([['qs', '^4.3.0']]);
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
import { parseutil } from '../utils/parse';
import test from './components/test';

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
import { parseutil } from '../util/parse';
import test from './component/test';

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

  it('getMockDependencies', () => {
    expect(
      getMockDependencies(
        `
import moment from 'moment';
import qs from 'qs';
import data from './test.json';

export default {
  'GET /api/test': { text: 'ok' },
};
`,
        {
          devDependencies: {
            moment: '^2.0.0',
          },
          dependencies: {
            qs: '4.0.0',
          },
        },
      ),
    ).toEqual({
      moment: '^2.0.0',
      qs: '4.0.0',
    });
  });

  it('getAllBlockDependencies', () => {
    expect(
      getAllBlockDependencies(join(__dirname, '../../../fixtures/block/test-blocks'), {
        blockConfig: {
          dependencies: ['demo'],
        },
        dependencies: {},
      }),
    ).toEqual({
      antd: '^3.8.0',
      'rc-select': '~2.1.0',
    });

    expect(
      getAllBlockDependencies(join(__dirname, '../../../fixtures/block/test-blocks'), {
        dependencies: {
          moment: '2.3.2',
        },
      }),
    ).toEqual({
      moment: '2.3.2',
    });

    expect(
      getAllBlockDependencies(join(__dirname, '../../../fixtures/block/test-blocks'), {
        blockConfig: {
          dependencies: ['demo', 'demo-with-dependencies'],
        },
        dependencies: {
          moment: '2.3.2',
        },
      }),
    ).toEqual({
      moment: '2.3.2',
      antd: '^3.8.0',
      'rc-select': '~2.1.0',
    });

    expect(
      getAllBlockDependencies(join(__dirname, '../../../fixtures/block/test-blocks'), {
        blockConfig: {
          dependencies: ['demo-with-dependencies'],
        },
      }),
    ).toEqual({
      antd: '^3.8.0',
      'rc-select': '~2.1.0',
    });

    try {
      expect(
        getAllBlockDependencies(join(__dirname, '../../../fixtures/block/test-blocks'), {
          blockConfig: {
            dependencies: ['demo-with-dependencies'],
          },
          dependencies: {
            antd: '2.0.0',
          },
        }),
      ).toEqual({
        antd: '^3.10.0',
      });
    } catch (error) {
      expect(error.message).toContain('* antd: ^3.8.0 not compatible with 2.0.0');
    }
  });
});
