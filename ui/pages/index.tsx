import { useAppData } from '@/hooks/useAppData';
import { getOverviewNumber } from '@/utils/getOverviewNumber';
import { Icon, NavLink, styled } from 'umi';

const cardList = [
  {
    name: 'Routes',
    path: '/routes',
    icon: 'cluster-outlined',
    textColor: '#4096ff',
    color: 'rgba(64, 150, 255, .2)',
  },
  {
    name: 'Plugins',
    path: '/plugins',
    icon: 'api-outlined',
    textColor: '#73d13d',
    color: 'rgba(115, 209, 61, .2)',
  },
  {
    name: 'Imports',
    path: '/imports',
    icon: 'right-square-outlined',
    textColor: '#f759ab',
    color: 'rgba(247, 89, 171, .2)',
  },
];

const cardColorStr = cardList
  .map((item) => {
    return `
    .card-item-${item.name}:hover {
      color: ${item.textColor};
      .card-content {
        background: ${item.color};
      }
    }
  `;
  })
  .join('');

const gitHubList = [
  {
    label: 'Star On Github',
    link: 'https://github.com/umijs/umi',
    icon: 'star-outlined',
    color: '#1677ff',
    key: 'star',
  },
  {
    label: 'Ideas & Suggestions',
    link: 'https://github.com/umijs/umi/discussions',
    icon: 'bulb-outlined',
    color: '#fadb14',
    key: 'idea',
  },
  {
    label: 'Bug Report',
    link: 'https://github.com/umijs/umi/issues',
    icon: 'bug-outlined',
    color: '#f5222d',
    key: 'bug',
  },
];

const gitColorStr = gitHubList
  .map((item) => {
    return `
    .github-item-${item.key}:hover {
      color: ${item.color}
    }
  `;
  })
  .join('');

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .content {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .logo {
      display: flex;
      align-items: center;

      span {
        font-size: 3rem;
        margin-left: 1.5rem;
        color: var(--accent-color);
      }
    }

    .card-list {
      margin-top: 2rem;
      display: flex;

      .card-item {
        padding: 0.5rem;

        .card-content {
          cursor: pointer;
          padding: 2rem 4rem;
          background: var(--card-bg-color);
          border-radius: 5%;

          div {
            display: flex;
            justify-content: center;
          }

          .card-info {
            margin-top: 0.5rem;

            .number {
              margin-right: 0.5rem;
            }
          }
        }
      }
    }

    .github-list {
      margin-top: 2rem;
      display: flex;

      .github-item {
        display: flex;
        align-items: center;
        padding: 0 1rem;
        cursor: pointer;

        span {
          margin-left: 0.5rem;
        }
      }
    }

    ${cardColorStr}
    ${gitColorStr}
  }
`;

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  const nums = getOverviewNumber(data);

  return (
    <Wrapper>
      <div className="content">
        <div className="logo">
          <Icon width="84" height="81" viewBox="0 0 28 27" icon="local:umi" />
          <span>Umi UI</span>
        </div>
        <div className="card-list">
          {cardList.map((item, index) => {
            return (
              <NavLink
                to={item.path}
                key={item.name}
                className={`card-item card-item-${item.name}`}
              >
                <div className="card-content">
                  <div>
                    <Icon
                      width="3em"
                      height="3em"
                      icon={`ant-design:${item.icon}`}
                    />
                  </div>
                  <div className="card-info">
                    <span className="number">{nums[index]}</span>
                    <span>{item.name}</span>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
        <div className="github-list">
          {gitHubList.map((item) => {
            return (
              <a
                target="_blank"
                href={item.link}
                className={`github-item github-item-${item.key}`}
                key={item.key}
              >
                <Icon icon={`ant-design:${item.icon}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
}
