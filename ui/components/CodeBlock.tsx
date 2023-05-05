import { styled } from 'umi';

const Wrapper = styled.pre`
  background: var(--bg-color);
  font-size: 0.88rem;
  font-family: 'MonoLisa', sans-serif;
  padding: 16px;
  color: var(--text-color);
`;

export function CodeBlock(props: { code: string | object }) {
  return (
    <Wrapper>
      <code>
        {typeof props.code === 'string'
          ? props.code
          : JSON.stringify(props.code, null, 2)}
      </code>
    </Wrapper>
  );
}
