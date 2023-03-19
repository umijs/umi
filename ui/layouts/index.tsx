import { Logo } from '@/components/Logo';
import { Menu } from '@/components/Menu';
import { ConfigProvider } from 'antd';
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
    padding: 1rem;
  }
`;

export default function Layout() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#117cf3',
        },
      }}
    >
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
    </ConfigProvider>
  );
}
