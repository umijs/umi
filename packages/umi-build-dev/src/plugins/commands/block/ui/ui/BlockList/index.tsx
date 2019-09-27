import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Col, Empty, Row, Spin, Typography, Tag, Button, Pagination } from 'antd';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { Loading } from '@ant-design/icons';

import styles from './index.module.less';
import HighlightedText from './HighlightedText';
import Adder from '../Adder';
import { Block, AddBlockParams, Resource } from '../../../data.d';
import Context from '../UIApiContext';

const { CheckableTag } = Tag;

interface BlockItemProps {
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
  onAddClick,
  keyword,
  onAddSuccess,
}) => {
  const { api } = useContext(Context);
  const isBlock = type === 'block';
  const style = {
    flex: '0 1 20%',
    overflow: 'hidden',
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
  const { list = [], loading, keyword } = props;
  const { api } = useContext(Context);
  const { uniq, flatten } = api._;
  const pageSize = 15;

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
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredList: Block[] = useMemo<Block[]>(
    () => {
      return list.filter(({ name = '', description = '', tags = [] }) => {
        return (
          (!selectedTag || tags.includes(selectedTag)) &&
          (!keyword || name.includes(keyword) || description.includes(keyword))
        );
      });
    },
    [keyword, selectedTag, list],
  );

  const currentPageList: Block[] = useMemo<Block[]>(
    () => {
      return filteredList.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize > filteredList.length ? filteredList.length : currentPage * pageSize,
      );
    },
    [filteredList, currentPage],
  );

  const isEmpty = !list || list.length === 0;

  let contents;
  if (loading) {
    contents = (
      <div className={styles.emptyWrapper}>
        <Spin size="large" />
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
      <>
        <Row gutter={20} type="flex">
          {currentPageList.map(item => (
            <BlockItem key={item.url} item={item} {...props} />
          ))}
        </Row>
        {filteredList.length > pageSize && (
          <Row type="flex" justify="end">
            <Pagination
              current={currentPage}
              onChange={setCurrentPage}
              total={filteredList.length}
              pageSize={pageSize}
            />
          </Row>
        )}
      </>
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
        {loading && <Loading />}
      </div>
      <div className={styles.cardContainer}>{contents}</div>
    </>
  );
};

export default BlockList;
