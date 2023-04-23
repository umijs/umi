import { makeAutoObservable } from 'mobx';

export default class Counter {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increase() {
    this.count = this.count + 1;
  }

  decrease() {
    this.count = this.count - 1;
  }
}
