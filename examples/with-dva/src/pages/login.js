import { Button } from 'antd';
import { connect } from 'dva';

export default connect()(({ dispatch }) => {
  return (
    <div>
      <h1>Login Page</h1>
      <Button
        onClick={() => {
          dispatch({
            type: 'global/login',
          });
        }}
      >
        Login
      </Button>
    </div>
  );
});
