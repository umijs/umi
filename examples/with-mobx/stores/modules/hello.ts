import { makeObservable, observable, override, action } from 'mobx';

class BaseHello {
  @observable
  msg = 'base hello';

  constructor() {
    makeObservable(this);
  }

  @action sayHello() {
    this.msg = 'say base hello world';
  }
}

export default class Hello extends BaseHello {
  msg = 'hello mobx';
  @override sayHello(): void {
    this.msg = 'say hello world';
  }
}
