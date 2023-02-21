import { Logo } from '@/components/Logo';
import { Menu } from '@/components/Menu';
import { Outlet } from 'umi';

export default function Layout() {
  return (
    <div>
      <aside>
        <Logo />
        <Menu />
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
