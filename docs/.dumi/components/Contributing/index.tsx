import React from 'react';
import styled from 'styled-components';
import { Link } from 'umi';
import { SectionHeader } from '../SectionHeader';

const ContributingWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto 60px;
  p {
    font-size: 18px;
    color: #4a5e71;
    margin-bottom: 16px;
  }

  p a {
    color: #0273dc;
    text-decoration: none;
  }
`;

export const Contributing = () => {
  return (
    <ContributingWrapper>
      <SectionHeader title="参与建设" />
      <div>
        <p className="contributing-text">
          社区有非常多小伙伴在和我们一同建设 Umi，如果你有兴趣，欢迎&nbsp;
          <Link to="/docs/introduce/contributing">加入我们</Link> 。
        </p>
        <div>
          <a href="https://github.com/umijs/umi/graphs/contributors">
            <img
              src="https://opencollective.com/umi/contributors.svg?width=1200&button=false"
              width="1200"
              height="184"
            />
          </a>
        </div>
      </div>
    </ContributingWrapper>
  );
};
