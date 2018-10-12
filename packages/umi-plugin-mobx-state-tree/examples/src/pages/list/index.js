import { inject, observer } from 'mobx-react';
import { Button } from 'antd';
import { Rate, Row, Col } from 'antd';
function App({ list }) {
  const { name, setTitle } = list;
  return (
    <div>
      <Row>
        <Col span={12} />
        <Col span={12}>
          <Rate allowHalf defaultValue={5} />
          <h2>{name}</h2>
          <Button
            type="primary"
            onClick={() => {
              setTitle('new name');
              console.log('click');
            }}
          >
            点击
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default inject(({ stores }) => ({
  list: stores.list,
}))(observer(App));
