// @ts-ignore
import { request, useRequest } from '@@/plugin-request';
// @ts-ignore
import { Button } from 'antd';

export default () => {
  const { data, error, loading } = useRequest('/api/users');
  return (
    <div>
      <h1>users</h1>
      <div>{loading ? 'loading' : 'done'}</div>
      <div>
        {data?.users?.map((item: any, index: any) => {
          return <div key={index}>{item.name}</div>;
        })}
      </div>
      <Button
        type={'primary'}
        onClick={() => {
          request('/api/error')
            .then((res) => {
              console.log(res);
            })
            .catch((e) => {
              console.log(e);
            });
        }}
      >
        发送一个错误请求
      </Button>
    </div>
  );
};
