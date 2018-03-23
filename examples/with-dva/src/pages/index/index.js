import Link from 'umi/link';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import { FormattedDate } from 'react-intl';
import Count from './components/Count';
import styles from './index.css';

function App(props) {
  return (
    <div className={styles.normal}>
      <FormattedDate value={Date.now()} />
      <h2>
        {props.text} @ {props.pathname}
      </h2>
      <Count />
      <br />
      <Button
        onClick={() => {
          props.dispatch({
            type: 'global/setText',
          });
        }}
      >
        Set Title
      </Button>
      <Button
        onClick={() => {
          props.dispatch({
            type: 'global/throwError',
          });
        }}
      >
        Throw error
      </Button>
      <br />
      <div>
        <Link to="/list">Go to /list</Link>
      </div>
      <div>
        <Link to="/list/list">Go to /list/list</Link>
      </div>
      <div>
        <Link to="/list/search">Go to /list/search</Link>
      </div>
      <div>
        <Link to="/admin">Go to /admin</Link>
      </div>
    </div>
  );
}

export default connect(state => {
  return {
    pathname: state.routing.location.pathname,
    text: state.global.text,
  };
})(App);
