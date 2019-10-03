import { useEffect, useState } from 'react';
import { Link } from 'umi';

function Page(props) {
  const { list } = props;
  return (
    <div>
      <Link to="/">index</Link>
      <h1>Page users</h1>
      <h2>users</h2>
      <ul>
        { (list || []).map(user => <li key={user}>{user}</li>) }
      </ul>
    </div>
  );
}

Page.getInitialProps = async () => {
  console.log('Users getInitialProps');
  return Promise.resolve({
    list: ['foo', 'bar'],
  });
};

export default Page;
