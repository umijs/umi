import { connect } from 'dva';
import router from 'umi/router';

function ListSearch(props) {
  return (
    <div>
      <h1>
        {props.title} | {props.a} | {props.b}
      </h1>
      <div
        onClick={() => {
          router.goBack();
        }}
      >
        Back
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    a: state.a,
    b: state.b,
    title: state.search.title,
  };
}

export default connect(mapStateToProps)(ListSearch);
