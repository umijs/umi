import { CodeBlock } from '@/components/CodeBlock';
import { useAppData } from '@/hooks/useAppData';
import { styled } from 'umi';

const Wrapper = styled.div``;

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  return (
    <Wrapper>
      <h2>User Config</h2>
      <CodeBlock code={data.userConfig} />
      <h2>Config</h2>
      <CodeBlock code={data.config} />
      <h2>Default Config</h2>
      <CodeBlock code={data.defaultConfig} />
    </Wrapper>
  );
}
