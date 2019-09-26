import React, { useMemo, useState, useEffect } from 'react';
import { Col, Empty, Row, Spin, Typography, Tag, Button } from 'antd';
import { IUiApi } from 'umi-types';
import LazyLoad, { forceCheck } from 'react-lazyload';

import styles from './index.module.less';
import HighlightedText from './HighlightedText';
import Adder from '../Adder';
import { Block, AddBlockParams, Resource } from '../../../data.d';

const { CheckableTag } = Tag;

interface BlockListProps {
  api: IUiApi;
  name?: string;
  type: Resource['blockType'];
  list: Block[];
  addingBlock: string;
  onAddClick: (params: AddBlockParams) => void;
  onAddSuccess: (params: AddBlockParams) => void;
  loading?: boolean;
  keyword?: string;
}

const renderMetas = (item: any, keyword?: string) => (
  <div className={styles.metas}>
    <span className={styles.tags}>
      {item.tags &&
        item.tags.map((tag: string) => (
          <span key={tag} className={styles.tagInCard}>
            <HighlightedText text={tag} highlight={keyword} />
          </span>
        ))}
    </span>
  </div>
);

const BlockList: React.FC<BlockListProps> = props => {
  const {
    list = [],
    type = 'block',
    addingBlock,
    loading,
    keyword,
    onAddClick,
    onAddSuccess,
    api,
  } = props;
  const { uniq, flatten } = api._;
  const tags: string[] = useMemo<string[]>(
    () => {
      return uniq(flatten(list.map(item => item.tags)));
    },
    [list],
  );

  useEffect(() => {
    document.getElementById('block-list-view').addEventListener(
      'scroll',
      () => {
        forceCheck();
      },
      { passive: true },
    );
  }, []);

  const [selectedTag, setSelectedTag] = useState<string>('');

  const isEmpty = !list || list.length === 0;

  let contents;
  if (loading) {
    contents = (
      <div className={styles.emptyWrapper}>
        <Spin />
      </div>
    );
  } else if (isEmpty) {
    contents = (
      <div className={styles.emptyWrapper}>
        <Empty />
      </div>
    );
  } else {
    contents = (
      <Row gutter={20} type="flex">
        {list
          .filter(item => !selectedTag || item.tags.includes(selectedTag))
          .map(item => (
            <Col
              style={{
                flex: `0 1 ${type === 'block' ? '20%' : '25%'}`,
              }}
              key={item.url}
            >
              <div className={type === 'block' ? styles.blockCard : styles.templateCard}>
                <Spin spinning={item.url === addingBlock} tip="Adding...">
                  <div className={styles.demo}>
                    <div className={styles.addProject}>
                      <Adder
                        api={api}
                        blockType={type}
                        block={item}
                        onAddClick={onAddClick}
                        onAddSuccess={onAddSuccess}
                      >
                        添加到项目
                      </Adder>
                      {item.previewUrl && (
                        <Button
                          className={styles.previewBtn}
                          target="_blank"
                          href={item.previewUrl}
                        >
                          预览
                        </Button>
                      )}
                    </div>

                    <LazyLoad
                      height={type === 'block' ? '20%' : '25%'}
                      key={item.url}
                      scrollContainer={document.getElementById('block-list-view')}
                      offset={100}
                    >
                      <img src={item.img} alt={item.url} />
                    </LazyLoad>
                  </div>
                </Spin>

                <div className={styles.content}>
                  <div className={styles.title}>
                    <HighlightedText text={item.name} highlight={keyword} />
                  </div>
                  {type === 'template' && (
                    <Typography.Paragraph
                      className={styles.description}
                      ellipsis={{ rows: 2, expandable: false }}
                    >
                      <HighlightedText text={item.description} highlight={keyword} />
                    </Typography.Paragraph>
                  )}
                  {renderMetas(item, keyword)}
                </div>
              </div>
            </Col>
          ))}
      </Row>
    );
  }

  return (
    <>
      <div className={styles.tagContainer}>
        <CheckableTag
          checked={selectedTag === ''}
          onChange={() => {
            setSelectedTag('');
          }}
        >
          全部
        </CheckableTag>
        {tags.map(tag => {
          return (
            <CheckableTag
              checked={selectedTag === tag}
              key={tag}
              onChange={checked => {
                if (checked) {
                  setSelectedTag(tag);
                } else {
                  setSelectedTag('');
                }
              }}
            >
              {tag}
            </CheckableTag>
          );
        })}
      </div>
      <div className={styles.cardContainer}>{contents}</div>
    </>
  );
};

export default BlockList;
