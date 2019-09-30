import React, { useState, useRef } from 'react';
import { Tag } from 'antd';
import { Loading, Up } from '@ant-design/icons';

import styles from './index.module.less';

const { CheckableTag } = Tag;

const sortTagMap = {
  表格: 10,
  表单: 9,
  通用: 8,
  列表: 7,
  用户: 6,
  数据录入: 5,
  数据展示: 4,
  基本: 3,
  高级: 2,
};

const sortTag = (a, b) => {
  if (sortTagMap[a]) {
    return -sortTagMap[a];
  }
  if (sortTagMap[b]) {
    return -sortTagMap[b];
  }
  return 0;
};

const TagSelect: React.FC<{
  value: string;
  onChange: (tag: string) => void;
  tagList: string[];
  loading: boolean;
}> = ({ value, tagList, onChange, loading }) => {
  const [expand, setExpandValue] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(undefined);
  let hasExpandButton = false;

  // 计算需不需要折行
  if (ref && ref.current) {
    const { clientHeight } = ref.current;
    if (clientHeight > 30) {
      hasExpandButton = true;
    }
  }

  return (
    <div
      className={`${styles.tagContainer} ${expand &&
        hasExpandButton &&
        styles.expand} ${hasExpandButton && styles.hasExpandButton}`}
      ref={ref}
    >
      <div className={styles.tagView}>
        {!loading && (
          <CheckableTag
            checked={value === ''}
            onChange={() => {
              onChange('');
            }}
          >
            全部
          </CheckableTag>
        )}
        {[...tagList]
          .sort(sortTag)
          .filter(tagName => tagName !== '废弃')
          .map(tag => (
            <CheckableTag
              checked={value === tag}
              key={tag}
              onChange={checked => {
                if (checked) {
                  onChange(tag);
                } else {
                  onChange('');
                }
              }}
            >
              {tag}
            </CheckableTag>
          ))}
        {loading && <Loading />}
        <span
          style={{
            flex: 999,
          }}
        />
      </div>
      {!loading && hasExpandButton ? (
        <a
          className={styles.expandButton}
          onClick={() => {
            setExpandValue(!expand);
          }}
        >
          <>
            {expand ? '展开' : '收起'} <Up className={styles.upIcon} />
          </>
        </a>
      ) : (
        ''
      )}
    </div>
  );
};
export default TagSelect;
