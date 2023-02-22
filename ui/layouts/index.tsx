import { Logo } from '@/components/Logo';
import { Menu } from '@/components/Menu';
import { Helmet, Outlet, styled } from 'umi';

const Wrapper = styled.div`
  display: flex;
  border: 1px solid var(--subtle-color);
  height: 100%;
  aside {
    min-width: 200px;
    border-right: 1px solid var(--subtle-color);
  }
  main {
    flex: 1;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 16px;
  }
`;

export default function Layout() {
  return (
    <Wrapper>
      <Helmet title="Umi UI" />
      <aside>
        <Logo />
        <Menu />
      </aside>
      <main>
        <Outlet />
      </main>
    </Wrapper>
  );
}
