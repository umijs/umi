import React, { useState, useEffect, useCallback } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((res) => {
        setUsers(res.users);
      });
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

const UserInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/users/1')
      .then((res) => res.json())
      .then((res) => {
        setUser(res);
      });
  }, []);

  return <p>{user?.name}</p>;
};

const CreateUser = () => {
  const onCreate = useCallback(() => {
    fetch('/api/users/create', { method: 'POST' })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          alert('create success');
        }
      });
  }, []);

  return <button onClick={onCreate}>创建</button>;
};

const IndexPage = () => {
  return (
    <div>
      <p>GET /api/users GET method </p>
      <UserList></UserList>
      <p>/api/users/1 GET can be omitted</p>
      <UserInfo></UserInfo>
      <p>POST /api/users/create</p>
      <CreateUser></CreateUser>

      <p>tip</p>

      <p>
        If we want to close the mock,We can set the environment variable
        MOCK=none,such as package.json start:no-mock
      </p>
    </div>
  );
};

export default IndexPage;
