import { Icon, styled } from 'umi';

const Wrapper = styled.div`
  span {
    color: var(--accent-color);
  }
`;

export function Logo() {
  return (
    <Wrapper>
      <Icon icon="local:umi" />
      <span>Umi UI</span>
    </Wrapper>
  );
}
