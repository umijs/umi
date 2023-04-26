import { useAppData } from '@/hooks/useAppData';
import { state as globalState } from '@/models/global';
import { Icon, NavLink, styled, useSnapshot } from 'umi';

const Wrapper = styled.div`
  & > div {
    a {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--subtle-color);

      span {
        margin-right: 0.5rem;
      }
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
  const { modules = [] } = useAppData()?.data?.ui || {};
  const { menus } = useSnapshot(globalState);
  const uiMenusAdded = modules.map((module) => module.menus || []).flat();

  return (
    <Wrapper>
      {menus.concat(uiMenusAdded).map((menu) => (
        <div key={menu.name}>
          <NavLink
            to={menu.path}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon icon={`ant-design:${menu.icon}`} />
            {menu.name}
          </NavLink>
        </div>
      ))}
    </Wrapper>
  );
}
