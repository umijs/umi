import { makeAutoObservable } from 'mobx';
export default class Search {
  constructor() {
    makeAutoObservable(this);
  }
  title = 'list-search-in-model';
}
