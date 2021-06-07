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
    const formData = new FormData();
    formData.append('name', 'ahwgs');
    fetch('/api/users/create', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          alert(`create success! name：${res.data.name}`);
        }
      });
  }, []);

  return <button onClick={onCreate}>Create User</button>;
};

const Http500 = () => {
  const onHandle = useCallback((code) => {
    fetch(`/api/status/${code}`).then((res) => {
      if (res.status !== 200) {
        alert(res.statusText);
      }
    });
  }, []);

  return (
    <>
      <button onClick={() => onHandle(500)}>Mock Http 500</button>
      <button onClick={() => onHandle(403)}>Mock Http 403</button>
    </>
  );
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
      <p>MOCK HTTP STATUS</p>
      <Http500></Http500>
      <p>tip</p>
      <p>
        If we want to close the mock,We can set the environment variable
        MOCK=none,such as package.json start:no-mock
      </p>
      <p>
        more config : https://umijs.org/zh-CN/docs/mock#mock-%E6%95%B0%E6%8D%AE
      </p>
    </div>
  );
};

export default IndexPage;
