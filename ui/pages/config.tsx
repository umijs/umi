import { useAppData } from '@/hooks/useAppData';

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Config</h1>
      <h2>User Config</h2>
      <pre>
        <code>{JSON.stringify(data.userConfig, null, 2)}</code>
      </pre>
    </div>
  );
}
