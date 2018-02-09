import { Component } from 'react';
import withRouter from 'umi/withRouter';
import { connect } from 'react-redux';

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
    }, 1000);
  }

  render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>;
    } else {
      return <div>{this.props.children}</div>;
    }
  }
}

export default withRouter(connect()(Layout));
