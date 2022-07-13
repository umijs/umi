import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';
import getCurrentRoute from './utils/getCurrentRoute';
import getRepoType from './utils/getRepoType';

export interface ArticleContributor {
  username: string;
  email: string;
  commitCount: number;
}

export interface ArticleGitMeta {
  createdTime: number;
  updatedTime: number;
  contributors: ArticleContributor[];
}

const getEditUrl = (
  repoUrl: string,
  repoType: string,
  branch: string,
  filePath: string,
): string => {
  switch (repoType) {
    case 'github':
    case 'gitee':
      return `${repoUrl}/edit/${branch}/docs/${filePath}`;
    case 'gitlab':
      return `${repoUrl}/-/edit/${branch}/docs/${filePath}`;
    default:
      return `${repoUrl}/blob/${branch}/docs/${filePath}`;
  }
};

const getDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export default () => {
  const { appData, themeConfig, location } = useThemeContext()!;
  const github = themeConfig.github;
  const {
    repo,
    branch = 'main',
    displayEditLink,
    displayUpdatedTime,
    displayCreatedTime,
    displayContributors,
  } = themeConfig.git || {};
  const lang = useLanguage();
  const route = getCurrentRoute(appData, lang, location);

  if (
    !route ||
    !route.git ||
    (!displayEditLink && !displayUpdatedTime && !displayContributors)
  ) {
    return <></>;
  }

  const getContributorsTitle = (contributors: ArticleContributor[]): string => {
    return contributors
      .map((contributor) => {
        const commitCount = contributor.commitCount;
        return `${contributor.username} [${commitCount} ${
          commitCount > 1 ? lang.render('commits') : lang.render('commit')
        }] <${contributor.email}>`;
      })
      .join(', ');
  };

  const routeGit: ArticleGitMeta = route.git;
  const editUrlBase = repo || github;
  const repoType = getRepoType(editUrlBase);
  const editUrl = getEditUrl(editUrlBase, repoType, branch, route.file);
  const createdTime = routeGit.createdTime * 1000;
  const updatedTime = routeGit.updatedTime * 1000;
  const contributors = routeGit.contributors;

  return (
    <div className="article-meta text-base leading-8 text-neutral-500 dark:text-neutral-300 mt-20 mb-8 flex flex-wrap flex-col md:flex-row md:justify-between">
      {editUrlBase && displayEditLink !== false && (
        <div className="flex md:basis-1/2">
          <a
            className="text-sky-600 dark:text-fuchsia-300 font-medium"
            href={editUrl}
            target="_blank"
          >
            {lang.render('Edit this page')}
          </a>
        </div>
      )}
      {displayUpdatedTime !== false && (
        <div
          className="flex md:basis-1/2 cursor-default"
          title={
            displayCreatedTime !== false
              ? `${lang.render('Created At')}: ${getDate(createdTime)}`
              : ''
          }
        >
          <span className="text-sky-600 dark:text-fuchsia-300 font-medium mr-1">
            {lang.render('Last Updated')}:
          </span>
          <span>{getDate(updatedTime)}</span>
        </div>
      )}
      {displayContributors !== false && (
        <div
          className="flex md:basis-1/2 cursor-default"
          title={getContributorsTitle(contributors)}
        >
          <span className="text-sky-600 dark:text-fuchsia-300 font-medium mr-1">
            {lang.render('Contributors')}:
          </span>
          <span>
            {contributors.map((contributor) => contributor.username).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};
