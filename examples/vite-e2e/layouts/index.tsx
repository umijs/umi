import { history, Link, Outlet } from 'umi';

function Layout() {
  return (
    <div>
      <h2 data-testid="layout-title">Vite e2e layout</h2>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">/about</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}

export default Layout;
