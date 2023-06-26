import React from 'react';
import styled from 'styled-components';

const NewsLetterFormWrapper = styled.div`
  font-size: 18px;
  margin-bottom: 14px;
  h2 {
    font-size: 18px;
    font-weight: 400;
  }
  input {
    background: #ffffff;
    border: 1px solid #bac1c8;
    width: 180px;
    font-size: 14px;
    height: 28px;
    line-height: 28px;
    padding: 0 4px;
  }

  button {
    font-size: 14px;
    color: #ffffff;
    margin-left: 14px;
    background-image: linear-gradient(
      224deg,
      #0071da 0%,
      #1890ff 100%,
      #1890ff 100%
    );
    height: 28px;
    line-height: 28px;
    padding: 0 10px;
    border: none;
  }

  button:hover {
    background-image: linear-gradient(
      224deg,
      #48a4fe 0%,
      #6fbafe 100%,
      #8dc9ff 100%
    );
  }
`;

export const NewsLetterForm = () => {
  return (
    <NewsLetterFormWrapper>
      <h2>订阅 Umi 的最新动态</h2>
      <form
        action="https://www.getrevue.co/profile/chencheng/add_subscriber"
        method="post"
        target="_blank"
      >
        <input
          type="text"
          name="member[email]"
          placeholder="请输入电子邮箱地址"
        />
        <button type="submit" name="member[subscribe]">
          订阅
        </button>
      </form>
    </NewsLetterFormWrapper>
  );
};
