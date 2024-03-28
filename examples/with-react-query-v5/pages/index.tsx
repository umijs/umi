import { useQuery } from 'umi';
import '../style.less';

export default function HomePage() {
  const { isFetching, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () => {
      return new Promise<{ stargazers_count: number }>((resolve, _) => {
        setTimeout(async () => {
          const res = await fetch('https://api.github.com/repos/umijs/umi');
          const json = await res.json();
          resolve(json);
        }, 500);
      });
    },
  });

  return (
    <div className="container">
      <div>
        <p className="title">UmiJS x react-query v5</p>
        {isFetching ? (
          <p>Loading ...</p>
        ) : (
          <p>UmiJS has {data?.stargazers_count} stars now!</p>
        )}
      </div>
    </div>
  );
}
