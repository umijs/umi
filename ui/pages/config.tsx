import { useAppData } from '@/hooks/useAppData';
import { styled } from 'umi';

const Wrapper = styled.div`
  pre {
    background: #1c1c1c;
    font-size: 0.88rem;
    font-family: 'MonoLisa', sans-serif;
    padding: 16px;
  }
`;

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  return (
    <Wrapper>
      <h2>User Config</h2>
      <pre>
        <code>{JSON.stringify(data.userConfig, null, 2)}</code>
      </pre>
      <h2>Config</h2>
      <pre>
        <code>{JSON.stringify(data.config, null, 2)}</code>
      </pre>
      <h2>Default Config</h2>
      <pre>
        <code>{JSON.stringify(data.defaultConfig, null, 2)}</code>
      </pre>
    </Wrapper>
  );
}
