import Link from 'umi/link';
import { connect } from 'dva';
import { Button } from 'antd-mobile';
import Count from './components/Count';
import styles from './page.css';

function App(props) {
  return (
    <div className={styles.normal}>
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
        <Link to="/list">Go to list.html</Link>
      </div>
      <div>
        <Link to="/admin">Go to admin.html</Link>
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
