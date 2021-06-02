import { useModel } from 'umi'
export default () => {
  const { initialState } = useModel('@@initialState');
  return (<div>Index Page,Hello {initialState?.username}</div>)
};
