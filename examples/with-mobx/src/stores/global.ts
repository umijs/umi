import { makeAutoObservable } from 'mobx';
import { history } from 'umi';

export default class GlobalModel {
  public text?: string;
  public login?: boolean;

  constructor(text: string, login: boolean = false) {
    this.text = text;
    this.login = login;
    makeAutoObservable(this);
  }

  signin = () => {
    this.login = true;
    history.push('/admin');
  };
  setText = (text: string) => {
    this.text = text;
    console.log(this.text);
  };
}
