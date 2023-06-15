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

  html [data-prefers-color='dark'] {
    h2 {
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;

export default (props: { title: string }) => {
  return (
    <SectionHeaderWrapper>
      <div></div>
      <h2>{props.title}</h2>
      <div></div>
    </SectionHeaderWrapper>
  );
};
