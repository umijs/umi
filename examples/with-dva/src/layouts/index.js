import withRouter from 'umi/withRouter';
import { connect } from 'dva';

function mapStateToProps(state) {
  return {
    text: state.global.text,
  };
}

export default withRouter(
  connect(mapStateToProps)(props => {
    return (
      <div>
        <h1>MAIN LAYOUT {props.text}</h1>
        {props.children}
      </div>
    );
  }),
);
