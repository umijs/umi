import { connect } from 'dva';

const mapStateToProps = state => ({ user: state.users.data[0] });
const Users = connect(mapStateToProps)(({ user }) => {
  return (
    <div>
      user: <span id="user">{user}</span>
    </div>
  );
});

export default connect()(({ dispatch }) => (
  <div>
    <h1>index</h1>
    <div>
      <h2>Users</h2>
      <Users />
    </div>
    <hr />
    <button
      onClick={() => {
        dispatch({ type: 'users/throwError' });
      }}
    >
      throw error
    </button>
  </div>
));
