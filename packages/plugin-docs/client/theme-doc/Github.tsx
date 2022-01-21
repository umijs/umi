import React from 'react';
import { useThemeContext } from './context';
// @ts-ignore
import GithubIcon from './icons/github.svg';

export default () => {
  const ctx = useThemeContext();

  if (!ctx?.themeConfig.github) {
    return null;
  }

  return (
    <a href={ctx.themeConfig.github}>
      <img src={GithubIcon} alt="Github" />
    </a>
  );
};
