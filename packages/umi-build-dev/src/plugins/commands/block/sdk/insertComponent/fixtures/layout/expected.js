import Foo from './Foo';
export default () => {
  return (
    <div>
      <h1>foo</h1>
      <Row>
        <Col>INSERT_BLOCK_PLACEHOLDER</Col>
        <Col>
          INSERT_BLOCK_PLACEHOLDER
          <Foo />
        </Col>
        <Col>INSERT_BLOCK_PLACEHOLDER:bar</Col>
        <Col>INSERT_BLOCK_PLACEHOLDER</Col>
      </Row>
    </div>
  );
};
