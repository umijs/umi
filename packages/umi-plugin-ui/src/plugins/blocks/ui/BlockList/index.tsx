import React, { Component } from 'react';
import { Button, Col, Empty, Row, Skeleton, Typography, Spin } from 'antd';
import styles from './index.module.less';
import HighlightedText from './HighlightedText';
import { Block } from '../../data.d';

interface BlockListProps {
  name?: string;
  type: string;
  list: Block[];
  addingBlock: string;
  onAdd: (block: Block) => void;
  loading?: boolean;
  keyword?: string;
}

interface BlockListState {
  showAll: boolean;
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

class BlockList extends Component<BlockListProps, BlockListState> {
  constructor(props: BlockListProps) {
    super(props);
    this.state = {
      showAll: false,
    };
  }

  handleShowAll = () => {
    this.setState({
      showAll: !this.state.showAll,
    });
  };

  render() {
    const { list = [], type = 'block', addingBlock, loading, keyword, onAdd } = this.props;

    const isEmpty = !list || list.length === 0;

    let contents;

    if (loading) {
      contents = (
        <div className={styles.emptyWrapper}>
          <Skeleton active />
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
          {list.map(item => (
            <Col
              style={{
                flex: `0 1 ${type === 'block' ? '20%' : '25%'}`,
              }}
              key={item.url}
            >
              <div className={type === 'block' ? styles.blockCard : styles.templateCard}>
                <div className={styles.demo}>
                  {item.url === addingBlock ? (
                    <Spin className={styles.spin} tip="Adding..." />
                  ) : (
                    <div className={styles.addProject}>
                      <Button
                        type="primary"
                        onClick={e => {
                          onAdd(item);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        添加到项目
                      </Button>
                    </div>
                  )}
                  <img src={item.img} />
                </div>

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

    return contents;
  }
}

export default BlockList;
