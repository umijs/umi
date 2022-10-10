import { useRequest } from 'umi';

export default function TestRequest() {
  return (
    <div>
      <h2>test request</h2>
      <Todos />
    </div>
  );
}

function Todos() {
  const { data, error, loading } = useRequest<{
    data: { text: string }[];
  }>(() => {
    return fetch('/api/todos').then((res) => res.json());
  });
  if (loading) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  return (
    <div>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
}
