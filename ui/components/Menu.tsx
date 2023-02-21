import { state as globalState } from '@/models/global';
import { NavLink, styled, useSnapshot } from 'umi';

const Wrapper = styled.div`
  & > div {
    border-top: 1px solid var(--subtle-color);
    a {
      display: block;
    }
    a:hover {
      background: var(--bg-hover-color);
    }
    .active {
      color: var(--highlight-color);
    }
  }
`;

export function Menu() {
  const { menus } = useSnapshot(globalState);
  return (
    <Wrapper>
      {menus.map((menu) => (
        <div key={menu.name}>
          <NavLink
            to={menu.path}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {menu.name}
          </NavLink>
        </div>
      ))}
    </Wrapper>
  );
}
