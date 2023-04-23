import { CodeBlock } from '@/components/CodeBlock';
import { useAppData } from '@/hooks/useAppData';
import { styled } from 'umi';

const Wrapper = styled.div``;

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  return (
    <Wrapper>
      <CodeBlock code={data.config} />
    </Wrapper>
  );
}
