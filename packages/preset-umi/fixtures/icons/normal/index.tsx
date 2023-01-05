import React from 'react';
import { foo } from './foo';
// @ts-ignore
import { jsx } from './jsx';
// @ts-ignore
import { bar } from 'bar';
import './a.less';
import './a.less?global';
import './a.jpg';
import './a.png';
import './a.sass';
import './a.css';
import './a.json';
// @ts-ignore
import json from 'ggg/a.json';
// @ts-ignore
import antd from '@alipay/bigfish/antd';
// @ts-ignore
import { alias } from '@/alias';
import 'alias-1';
// @ts-ignore
import { alias3, Icon } from 'alias-3';

console.log(1, foo, jsx, bar, json, antd, alias, alias3);
export function App() {
  return (
    <>
      <Icon name="xxx" />
      <Icon name="xxx2" />
      <Icon name="xxx222" />
    </>
  );
}
