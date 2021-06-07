import { kea } from 'kea';
const API_URL = 'https://api.github.com';

const logic = kea({
  actions: {
    setUsername: (username) => ({ username }),
    setRepositories: (repositories) => ({ repositories }),
    setFetchError: (error) => ({ error }),
  },

  reducers: {
    username: [
      'umijs',
      {
        setUsername: (_, { username }) => username,
      },
    ],
    repositories: [
      [],
      {
        setUsername: () => [],
        setRepositories: (_, { repositories }) => repositories,
      },
    ],
    isLoading: [
      false,
      {
        setUsername: () => true,
        setRepositories: () => false,
        setFetchError: () => false,
      },
    ],
    error: [
      null,
      {
        setUsername: () => null,
        setFetchError: (_, { error }) => error,
      },
    ],
  },

  selectors: {
    sortedRepositories: [
      (selectors) => [selectors.repositories],
      (repositories) => {
        return [...repositories].sort(
          (a, b) => b.stargazers_count - a.stargazers_count,
        );
      },
    ],
  },

  listeners: ({ actions }) => ({
    setUsername: async ({ username }, breakpoint) => {
      await breakpoint(300);

      const url = `${API_URL}/users/${username}/repos?per_page=250`;

      // 👈 handle network errors
      let response;
      try {
        response = await window.fetch(url);
      } catch (error) {
        actions.setFetchError(error.message);
        return; // 👈 nothing to do after, so return
      }

      // break if action was dispatched again while we were fetching
      breakpoint();

      const json = await response.json();

      if (response.status === 200) {
        actions.setRepositories(json);
      } else {
        actions.setFetchError(json.message);
      }
    },
  }),

  events: ({ actions, values }) => ({
    afterMount: () => {
      actions.setUsername(values.username);
    },
  }),
});

export default logic;
