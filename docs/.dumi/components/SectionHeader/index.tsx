import React from 'react';
import styled from 'styled-components';

const SectionHeaderWrapper = styled.div`
  display: flex;
  margin-bottom: 40px;
  div {
    flex: 1;
    border-top: 1px solid #ebf0f4;
    height: 1px;
    margin-top: 18px;
  }

  h2 {
    font-size: 26px;
    color: #2a445d;
    text-align: center;
    padding: 0 20px;
    margin: 0;
    font-weight: 400;
  }
`;

export const SectionHeader = (props: { title: string }) => {
  return (
    <SectionHeaderWrapper>
      <div className="section-header-line"></div>
      <h2 className="section-header-title">{props.title}</h2>
      <div className="section-header-line"></div>
    </SectionHeaderWrapper>
  );
};
