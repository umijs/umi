import React, { useMemo, useContext, useState, useEffect } from 'react';
import { Empty, Row, Spin, Pagination } from 'antd';
import { forceCheck } from 'react-lazyload';

import styles from './index.module.less';
import { Block, AddBlockParams, Resource } from '../../../data.d';
import Context from '../UIApiContext';
import TagSelect from '../TagSelect';
import BlockItem from './BlockItem';

interface BlockItemProps {
  type: Resource['blockType'];
  addingBlock?: Block;
  item: Block;
  disabled?: boolean;
  loading?: boolean;
  onShowModal?: (Block: Block, option: AddBlockParams) => void;
  onHideModal?: () => void;
  keyword?: string;
}
interface BlockListProps extends Omit<BlockItemProps, 'item'> {
  name?: string;
  list: Block[];
}

const BlockList: React.FC<BlockListProps> = props => {
  const { list = [], addingBlock, keyword, loading } = props;
  const { api } = useContext(Context);
  const { uniq, flatten } = api._;
  const isMini = api.isMini();
  const pageSize = isMini ? 80 : 10;

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
  useEffect(
    () => {
      setSelectedTag('');
      setCurrentPage(1);
    },
    [list],
  );

  const filteredList: Block[] = useMemo<Block[]>(
    () =>
      list.filter(({ name = '', url, description = '', tags: listTags = [] }) => {
        return (
          ((!selectedTag || listTags.join('').includes(selectedTag)) &&
            (!keyword ||
              name.toLocaleLowerCase().includes(keyword) ||
              description.toLocaleLowerCase().includes(keyword))) ||
          url.toLocaleLowerCase().includes(keyword)
        );
      }),
    [keyword, selectedTag, list.map(({ url }) => url).join('/')],
  );

  const currentPageList: Block[] = useMemo<Block[]>(
    () =>
      filteredList.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize > filteredList.length ? filteredList.length : currentPage * pageSize,
      ),
    [filteredList, currentPage],
  );

  const isEmpty = !currentPageList || currentPageList.length === 0;

  let contents;
  if (loading) {
    contents = (
      <div className={styles.emptyWrapper}>
        <Spin size="large" />
      </div>
    );
  } else if (isEmpty) {
    // 切换为黑色背景图片
    contents = (
      <div className={styles.emptyWrapper}>
        <Empty
          image="https://gw.alipayobjects.com/mdn/rms_4f0d74/afts/img/A*LinHSLLEHUAAAAAAAAAAAABkARQnAQ"
          description={keyword ? '未搜索到任何数据' : '暂无数据'}
        />
      </div>
    );
  } else {
    contents = (
      <div
        style={{
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <Row gutter={20} type="flex">
          {currentPageList.map(item => (
            <BlockItem
              key={item.url}
              item={item}
              {...props}
              loading={addingBlock && item.url === addingBlock.url}
              disabled={addingBlock && addingBlock.url && item.url !== addingBlock.url}
            />
          ))}
        </Row>
        {filteredList.length > pageSize && (
          <Row type="flex" justify="end">
            <Pagination
              size={isMini ? 'small' : undefined}
              current={currentPage}
              onChange={setCurrentPage}
              total={filteredList.length}
              pageSize={pageSize}
            />
          </Row>
        )}
      </div>
    );
  }

  return (
    <>
      <TagSelect
        tagList={tags}
        value={selectedTag}
        loading={loading}
        onChange={tagValue => setSelectedTag(tagValue)}
      />
      <div className={styles.cardContainer}>{contents}</div>
    </>
  );
};

export default BlockList;
