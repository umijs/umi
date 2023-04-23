import { Line, RingProgress } from '@ant-design/charts';
import { Card, Col, Row, Tabs } from 'antd';
import type { Datum, OfflineDataType } from '../data.d';
import styles from '../style.less';
import NumberInfo from './NumberInfo';

const CustomTab = ({
  data,
  currentTabKey: currentKey,
}: {
  data: OfflineDataType;
  currentTabKey: string;
}) => (
  <Row gutter={8} style={{ width: 138, margin: '8px 0' }}>
    <Col span={12}>
      <NumberInfo
        title={data.name}
        subTitle="转化率"
        gap={2}
        total={`${data.cvr * 100}%`}
        theme={currentKey !== data.name ? 'light' : undefined}
      />
    </Col>
    <Col span={12} style={{ paddingTop: 36 }}>
      <RingProgress
        autoFit
        height={60}
        innerRadius={0.7}
        width={60}
        percent={data.cvr}
        statistic={{
          title: false,
          content: false,
        }}
      />
    </Col>
  </Row>
);

const { TabPane } = Tabs;

const OfflineData = ({
  activeKey,
  loading,
  offlineData,
  offlineChartData,
  handleTabChange,
}: {
  activeKey: string;
  loading: boolean;
  offlineData: OfflineDataType[];
  offlineChartData: Datum[];
  handleTabChange: (activeKey: string) => void;
}) => (
  <Card
    loading={loading}
    className={styles.offlineCard}
    bordered={false}
    style={{ marginTop: 32 }}
  >
    <Tabs activeKey={activeKey} onChange={handleTabChange}>
      {offlineData.map((shop) => (
        <TabPane
          tab={<CustomTab data={shop} currentTabKey={activeKey} />}
          key={shop.name}
        >
          <div style={{ padding: '0 24px' }}>
            <Line
              autoFit
              height={400}
              data={offlineChartData}
              xField="date"
              yField="value"
              seriesField="type"
              slider={{
                start: 0.1,
                end: 0.5,
              }}
              interactions={[
                {
                  type: 'slider',
                  cfg: {},
                },
              ]}
              legend={{
                position: 'top',
              }}
            />
          </div>
        </TabPane>
      ))}
    </Tabs>
  </Card>
);

export default OfflineData;
