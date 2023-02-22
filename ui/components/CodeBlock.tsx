import { styled } from 'umi';

const Wrapper = styled.pre`
  background: #1c1c1c;
  font-size: 0.88rem;
  font-family: 'MonoLisa', sans-serif;
  padding: 16px;
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
