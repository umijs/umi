import CountModel from './count';
import GlobalModel from './global';
import SearchModel from './search';
interface Stores {
  count: CountModel;
  global: GlobalModel;
  search: SearchModel;
}

export default function createMobxStores(): Stores {
  return {
    count: new CountModel(),
    global: new GlobalModel('hello umi+mobx', false),
    search: new SearchModel(),
  };
}
