import React, { useState, useContext, useEffect, useMemo, useLayoutEffect } from 'react';
import { Tabs } from 'antd';
import { stringify, parse } from 'qs';
import styles from './index.module.less';
import { Resource } from '../../../data';
import Container from '../Container';

const { TabPane } = Tabs;

export default function() {
  const { api, type, setType, setActiveResource } = Container.useContainer();
  const { callRemote, intl } = api;

  const getQueryConfig = () => parse(window.location.search.substr(1));
  const updateUrlQuery = (params: { type: string; resource?: string }) => {
    const defaultParas = getQueryConfig();
    window.history.pushState(
      {},
      '',
      `?${stringify({
        ...defaultParas,
        ...params,
      })}`,
    );
  };

  return (
    <Tabs
      className={styles.tabs}
      size="large"
      activeKey={type}
      onChange={activeKey => {
        setType(activeKey as Resource['blockType']);
        setActiveResource(null);
        /**
         * 修改 url 中的参数，数据源改变时
         * 清空 resource
         */
        updateUrlQuery({
          type: activeKey,
          resource: undefined,
        });
      }}
    >
      <TabPane tab={intl({ id: 'org.umi.ui.blocks.tabs.blocks' })} key="block" />
      <TabPane tab={intl({ id: 'org.umi.ui.blocks.tabs.templates' })} key="template" />
    </Tabs>
  );
}
