import { Component } from 'react';
import dynamic from 'umi/dynamic';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const A = dynamic(async function() {
  await delay(/* 1s */ 1000);
  return () => <div>A rendered after 1s</div>;
});

const B = dynamic({
  resolve: async function() {
    await delay(/* 1s */ 1000);
    return () => <div>B rendered after 1s</div>;
  },
  LoadingComponent() {
    return <div>Custome Loading...</div>;
  },
});

export default class Dynamic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      A: false,
      B: false,
    };
  }
  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.setState({ A: true });
          }}
        >
          loadA
        </button>
        {this.state.A ? <A /> : <div>A is not loaded</div>}
        <button
          onClick={() => {
            this.setState({ B: true });
          }}
        >
          loadB
        </button>
        {this.state.B ? <B /> : <div>B is not loaded</div>}
      </div>
    );
  }
}
