import React from 'react';
import { IUiApi } from 'umi-types';
import Logo from './components/logo';
import CreateButton from './components/createButton';

/**
 * Bigfish Compact Config
 */
export default (api: IUiApi) => {
  api.modifyBasicUI({
    name: 'Bigfish',
    logo: <Logo />,
    logo_remote:
      'https://gw.alipayobjects.com/zos/antfincdn/hGDyUOjsDS/430be478-0a70-4e82-99cc-b2ec526bfff2.png',
    feedback: {
      src: '//gw-office.alipayobjects.com/basement_prod/bd018d14-7cfd-4410-97dc-84bfd7bb6a8c.jpg',
      width: 150,
      height: 200,
    },
    helpDoc: 'https://bigfish.antfin-inc.com/doc/bigfish-ui',
    'create.project.button': <CreateButton api={api} />,
  });
};
