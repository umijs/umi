import { makeAutoObservable } from 'mobx';
export default class Counter {
  constructor() {
    makeAutoObservable(this);
  }
  count = 0;

  increase = () => {
    this.count++;
    console.log(this);
  };

  decrease = () => {
    this.count--;
  };
}
