import React, { useMemo, useContext } from 'react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { Spin } from 'antd';
import styles from './index.module.less';
import Context from '../UIApiContext';

export default props => {
  const {
    type,
    matchedResources,
    current,
    setActiveResource,
    updateUrlQuery,
    blocks,
    selectedTag,
    setSelectedTag,
    loading,
  } = props;
  const { api } = useContext(Context);
  const { uniq, flatten } = api._;

  const tags: string[] = useMemo<string[]>(
    () => uniq(flatten(blocks.map(item => (item.category ? [item.category] : item.tags)))),
    [blocks],
  );

  // const sortTagMap = {
  //   表格: 10,
  //   表单: 9,
  //   通用: 8,
  //   列表: 7,
  //   用户: 6,
  //   数据录入: 5,
  //   数据展示: 4,
  //   基本: 3,
  //   高级: 2,
  // };
  //
  // const sortTag = (a, b) => {
  //   if (sortTagMap[a]) {
  //     return -sortTagMap[a];
  //   }
  //   if (sortTagMap[b]) {
  //     return -sortTagMap[b];
  //   }
  //   return 0;
  // };

  function renderCats() {
    if (loading) {
      return (
        <div className={`${styles.cats} ${loading ? styles.catsLoading : ''}`}>
          <Spin size="large" />
        </div>
      );
    }
    const getTagCls = selected =>
      cls(styles.cat, {
        [styles.current]: selectedTag === selected,
      });
    return (
      <div className={styles.cats}>
        <div key="全部" className={getTagCls('')} onClick={() => setSelectedTag('')}>
          全部
        </div>
        {tags
          // .sort(sortTag)
          .filter(tag => tag !== '废弃')
          .map(tag => (
            <div key={tag} className={getTagCls(tag)} onClick={() => setSelectedTag(tag)}>
              {tag}
            </div>
          ))}
      </div>
    );
  }

  function renderResources() {
    function resourceSwitchHandler(r) {
      if (r.id === current.id) {
        setActiveResource({ id: null });
        return;
      }
      setActiveResource(r);
      updateUrlQuery({ type, resource: r.id });
    }

    return matchedResources.map(r => {
      const isCurrent = current.id === r.id;
      const resourceCls = cls(styles.resource, {
        [styles.current]: !!isCurrent,
      });
      return (
        <React.Fragment key={r.id}>
          <div className={resourceCls} onClick={resourceSwitchHandler.bind(null, r)}>
            <div className={styles.icon}>
              <img src={r.icon} style={{ width: '32px', height: '32px' }} />
            </div>
            <div className={styles.titleAndDescription}>
              <div className={styles.title}>{r.name}</div>
              <div className={styles.description}>{r.description}</div>
            </div>
            <div className={styles.switcher}>
              {isCurrent ? (
                <UpOutlined style={{ fontSize: '12px' }} />
              ) : (
                <DownOutlined style={{ fontSize: '12px' }} />
              )}
            </div>
          </div>
          {isCurrent ? renderCats() : null}
        </React.Fragment>
      );
    });
  }

  return <>{renderResources()}</>;
};
