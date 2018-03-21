import { connect } from 'dva';
import router from 'umi/router';
import styles from './index.css';

function App(props) {
  return (
    <div className={styles.normal}>
      <h2>
        {props.text} @ {props.pathname}
      </h2>
      <div
        onClick={() => {
          router.goBack();
        }}
      >
        Back
      </div>
      <div>
        test: {props.a} | {props.b}
      </div>
    </div>
  );
}

export default connect(state => {
  return {
    pathname: state.routing.location.pathname,
    text: state.global.text,
    a: state.a,
    b: state.b,
  };
})(App);
