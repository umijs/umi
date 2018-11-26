import React, { Component } from 'react';
import { connect } from 'dva';

@connect(({ a }) => {
  return { a };
})
class TestPage extends Component {
  render() {
    const { a } = this.props;
    return <div className="e2etest-a">{a.text}</div>;
  }
}

export default TestPage;
