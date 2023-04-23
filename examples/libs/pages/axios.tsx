import axios from 'axios';
import React, { useEffect } from 'react';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

axios.interceptors.request.use(
  async (config) => {
    console.log('Request Interceptor', config);
    await delay(3000);
    console.log('after delay');
    return config;
  },
  (error) => {
    console.log('Request Interceptor Error', error);
    return Promise.reject(error);
  },
);

export default () => {
  useEffect(() => {
    (async () => {
      const res = await axios.get('/api/axios/users');
      console.log(res);
    })();
  }, []);

  return (
    <div>
      <h1>Axios</h1>
      <button>fetch</button>
    </div>
  );
};
