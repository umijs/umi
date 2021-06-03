export interface SearchModelState {
  title?: string;
}

interface SearchModelType {
  namespace: 'search';
  state: SearchModelState;
  reducers: {};
}

const SearchModel: SearchModelType = {
  namespace: 'search',
  state: {
    title: 'list-search-in-model',
  },
  reducers: {},
};

export default SearchModel;
