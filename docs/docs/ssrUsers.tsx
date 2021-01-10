/* eslint-disable react/jsx-no-target-blank */

import React from 'react';

const USERS = [
  {
    name: 'Ant Group official website',
    link: 'https://www.antgroup.com',
    logo: 'https://img.alicdn.com/tfs/TB1olOTGXY7gK0jSZKzXXaikpXa-2145-498.png',
  },
  {
    name: 'Arhat Hall official website',
    link: 'https://www.luohanacademy.com/',
    logo:
      'https://gw.alipayobjects.com/mdn/rms_6ab82c/afts/img/A*qPp4QKXu5HQAAAAAAAAAAABkARQnAQ',
  },
  {
    name: 'About Alipay',
    link: 'https://about.alipay.com/',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/bsLuElJnYSyLnSOLjKth.png',
  },
  {
    name: 'INCLUSION Bund Conference',
    link: 'https://www.inclusionconf.com/',
    logo:
      'https://gw.alipayobjects.com/mdn/rms_60f090/afts/img/A*nipGQJEKyWEAAAAAAAAAAABkARQnAQ',
  },
  {
    name: 'Alipay Mini Program',
    link: 'https://miniprogram.alipay.com/docs/',
    logo:
      'https://ac.alipay.com/storage/2020/7/21/3ba523c1-ec48-48fc-9618-52302d05e01c.svg',
  },
  {
    name: 'Cainiao official website',
    link: 'https://www.cainiao.com/',
    logo: 'https://gw.alicdn.com/tfs/TB1j3vTRXXXXXb8aXXXXXXXXXXX-342-120.png',
  },
  {
    name: 'Alipay International Document Center',
    link: 'https://global.alipay.com/docs/',
    logo:
      'https://ac.alipay.com/storage/2020/6/4/5f7a45a1-3398-4029-8791-a9545a496642.svg',
  },
  {
    name: 'ZOLOZ Document Center',
    link: 'https://docs.zoloz.com/zoloz/saas/docs',
    logo: 'https://www.zoloz.com/hubfs/logos/logo.svg',
  },
];

export default () => {
  return (
    <ul
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {USERS.map((user, i) => (
        <li
          key={user.link}
          style={{
            width: 280,
            marginRight: i === USERS.length - 1 ? 0 : 16,
            marginBottom: 8,
            border: '1px solid #eee',
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          <a
            style={{
              display: 'block',
              color: '#666',
              padding: '18px 32px',
              textDecoration: 'none',
            }}
            target="_blank"
            href={user.link}
          >
            <img
              style={{
                maxWidth: '100%',
                marginBottom: 16,
              }}
              height="56"
              src={user.logo}
              alt={user.name}
            />
            <p style={{ margin: 0 }}>{user.name}</p>
          </a>
        </li>
      ))}
    </ul>
  );
};
