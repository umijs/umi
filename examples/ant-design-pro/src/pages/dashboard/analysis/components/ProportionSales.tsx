import type { PieConfig } from '@ant-design/charts';
import { Pie } from '@ant-design/charts';
import { Card, Radio, Typography } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import numeral from 'numeral';
import React from 'react';
import type { Datum } from '../data.d';
import styles from '../style.less';

const { Text } = Typography;

const ProportionSales = ({
  dropdownGroup,
  salesType,
  loading,
  salesPieData,
  handleChangeSalesType,
}: {
  loading: boolean;
  dropdownGroup: React.ReactNode;
  salesType: 'all' | 'online' | 'stores';
  salesPieData: Datum[];
  handleChangeSalesType?: (e: RadioChangeEvent) => void;
}) => {
  const pieConfig: PieConfig = {
    autoFit: true,
    height: 300,
    data: salesPieData,
    radius: 1,
    innerRadius: 0.64,
    angleField: 'y',
    colorField: 'x',
    legend: false,
    label: {
      type: 'spider',
      formatter: (text, item) => {
        // eslint-disable-next-line no-underscore-dangle
        return `${item._origin.x}: ${numeral(item._origin.y).format('0,0')}`;
      },
    },
    statistic: {
      title: {
        content: '销售额',
      },
    },
  };

  return (
    <Card
      loading={loading}
      className={styles.salesCard}
      bordered={false}
      title="销售额类别占比"
      style={{
        height: '100%',
      }}
      extra={
        <div className={styles.salesCardExtra}>
          {dropdownGroup}
          <div className={styles.salesTypeRadio}>
            <Radio.Group value={salesType} onChange={handleChangeSalesType}>
              <Radio.Button value="all">全部渠道</Radio.Button>
              <Radio.Button value="online">线上</Radio.Button>
              <Radio.Button value="stores">门店</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      }
    >
      <div>
        <Text>销售额</Text>
        <Pie {...pieConfig} />
      </div>
    </Card>
  );
};

export default ProportionSales;
