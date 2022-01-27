import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { FC } from 'react';
import React from 'react';

const KleinBlue = styled.h4`
  color: rgb(0, 47, 167);
`;
const BondiBlueCSS = css`
  color: rgb(0, 149, 182);
`;

const IndexPage: FC = () => {
  return (
    <div>
      umi with emotion
      <KleinBlue>klein Blue</KleinBlue>
      <h4 css={BondiBlueCSS}>Bondi Blue</h4>
    </div>
  );
};

export default IndexPage;
