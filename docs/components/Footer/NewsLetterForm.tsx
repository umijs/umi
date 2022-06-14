import React from 'react';
// @ts-ignore
import styles from './NewsLetterForm.css';

export default () => {
  return (
    <div className={styles.normal}>
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
    </div>
  );
};
