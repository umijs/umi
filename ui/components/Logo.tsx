import { Icon, styled } from 'umi';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--subtle-color);

  span {
    color: var(--accent-color);
    margin-right: 0.5rem;
    font-weight: bold;
    font-size: 1.125rem;
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
