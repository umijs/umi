import { connect } from 'dva';
import Redirect from 'umi/redirect';

function Admin({ login }) {
  if (login) {
    return <h1>Admin Page</h1>;
  } else {
    return <Redirect to="/login" />;
  }
}

function mapStateToProps(state) {
  return {
    login: state.global.login,
  };
}

export default connect(mapStateToProps)(Admin);
