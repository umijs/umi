import React, { useMemo, useState, useEffect } from 'react';
import { Col, Empty, Row, Spin, Typography, Tag, Button } from 'antd';
import { IUiApi } from 'umi-types';
import LazyLoad, { forceCheck } from 'react-lazyload';

import styles from './index.module.less';
import HighlightedText from './HighlightedText';
import Adder from '../Adder';
import { Block, AddBlockParams, Resource } from '../../../data.d';

const { CheckableTag } = Tag;

interface BlockItemProps {
  api: IUiApi;
  type: Resource['blockType'];
  addingBlock: string;
  item: Block;
  onAddClick: (params: AddBlockParams) => void;
  onAddSuccess: (params: AddBlockParams) => void;
  loading?: boolean;
  keyword?: string;
}
interface BlockListProps extends Omit<BlockItemProps, 'item'> {
  name?: string;
  list: Block[];
}

/**
 * 子区块 的 tag
 * @param
 */
const Meats: React.FC<{
  item: Block;
  keyword?: string;
}> = ({ item, keyword }) => (
  <div className={styles.meats}>
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

/**
 * 子区块的展示逻辑
 * @param param0
 */
const BlockItem: React.FC<BlockItemProps> = ({
  type,
  item,
  addingBlock,
  api,
  onAddClick,
  keyword,
  onAddSuccess,
}) => {
  const isBlock = type === 'block';
  const style = {
    flex: '0 1 20%',
  };
  const isMini = api.isMini();

  return (
    <Col style={style} key={item.url}>
      <div id={item.url} className={isBlock ? styles.blockCard : styles.templateCard}>
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
                <Button className={styles.previewBtn} target="_blank" href={item.previewUrl}>
                  预览
                </Button>
              )}
            </div>

            <LazyLoad
              height="20vh"
              key={item.url}
              scrollContainer={document.getElementById('block-list-view')}
              offset={100}
            >
              <div
                className={styles.img}
                style={{
                  backgroundImage: `url(${item.img})`,
                }}
              />
            </LazyLoad>
          </div>
        </Spin>

        <div className={styles.content}>
          <div className={styles.title}>
            <HighlightedText text={item.name} highlight={keyword} />
          </div>
          {item.description && !isMini && (
            <Typography.Paragraph
              className={styles.description}
              ellipsis={{ rows: 2, expandable: false }}
            >
              <HighlightedText text={item.description} highlight={keyword} />
            </Typography.Paragraph>
          )}
          {!isMini && <Meats item={item} keyword={keyword} />}
        </div>
      </div>
    </Col>
  );
};

const BlockList: React.FC<BlockListProps> = props => {
  const { list = [], loading, api } = props;

  const { uniq, flatten } = api._;

  const tags: string[] = useMemo<string[]>(() => uniq(flatten(list.map(item => item.tags))), [
    list,
  ]);

  // lazy load 的强制加载，不然 load 不刷新
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
            <BlockItem item={item} {...props} />
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
        {tags.map(tag => (
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
        ))}
      </div>
      <div className={styles.cardContainer}>{contents}</div>
    </>
  );
};

export default BlockList;
