import React from 'react';
// @ts-ignore
import styles from './NewsLetterForm.css';

export default () => {
  return (
    <div className={styles.normal}>
      <h2>Subscribe to the Latest Updates from Umi</h2>
      <form
        action="https://www.getrevue.co/profile/chencheng/add_subscriber"
        method="post"
        target="_blank"
      >
        <input
          type="text"
          name="member[email]"
          placeholder="Enter your email address"
        />
        <button type="submit" name="member[subscribe]">
          Subscribe
        </button>
      </form>
    </div>
  );
};
