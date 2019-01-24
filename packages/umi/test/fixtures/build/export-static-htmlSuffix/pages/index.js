import Link from 'umi/link';

export default function() {
  return (
    <div>
      <h1>Index Page</h1>
      <Link to="/list">
        <button type="primary">跳转到列表页</button>
      </Link>
    </div>
  );
}
