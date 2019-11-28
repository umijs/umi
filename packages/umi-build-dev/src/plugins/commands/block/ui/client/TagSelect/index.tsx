import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Tag } from 'antd';
import { LoadingOutlined, UpOutlined } from '@ant-design/icons';

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
  expandText: string;
  allText: string;
  collapseText: string;
  tagList: string[];
  loading: boolean;
}> = ({ value, tagList, onChange, loading, expandText, allText, collapseText }) => {
  const [expand, setExpandValue] = useState<boolean>(true);
  const [hasExpandButton, setHasExpandButton] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(undefined);

  useLayoutEffect(
    () => {
      // 计算需不需要折行
      if (ref && ref.current) {
        const { clientHeight } = ref.current;
        if (clientHeight > 30) {
          setHasExpandButton(true);
        } else {
          setHasExpandButton(false);
        }
      }
    },
    [loading, tagList.length],
  );

  return (
    <div
      className={`${styles.tagContainer} ${expand &&
        hasExpandButton &&
        styles.expand} ${hasExpandButton && styles.hasExpandButton}`}
    >
      <div className={styles.tagView} ref={ref}>
        {!loading && (
          <>
            <CheckableTag
              checked={value === ''}
              onChange={() => {
                onChange('');
              }}
            >
              {allText}
            </CheckableTag>
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
            <span
              style={{
                flex: 999,
              }}
            />
          </>
        )}

        {loading && <LoadingOutlined />}
      </div>
      {!loading && hasExpandButton ? (
        <a
          className={styles.expandButton}
          onClick={() => {
            setExpandValue(!expand);
          }}
        >
          <>
            {expand ? expandText : collapseText} <UpOutlined className={styles.upIcon} />
          </>
        </a>
      ) : (
        ''
      )}
    </div>
  );
};
export default TagSelect;
