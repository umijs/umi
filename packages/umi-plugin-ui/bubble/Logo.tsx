import React from 'react';
import styled from 'styled-components';

const Logo = styled('img')`
  width: 100%;
`;

export default () => {
  const img = window.g_bigfish
    ? 'https://gw.alipayobjects.com/zos/antfincdn/Sgm%24iyiAT2/bigfish.svg'
    : 'https://gw.alipayobjects.com/zos/antfincdn/2MEHoVcklV/umi.svg';
  return <Logo src={img} />;
};
