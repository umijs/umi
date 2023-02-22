import { CodeBlock } from '@/components/CodeBlock';
import { useAppData } from '@/hooks/useAppData';

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <h2>Imports</h2>
      <pre>
        <CodeBlock code={data.prepare.buildResult} />
      </pre>
    </div>
  );
}
