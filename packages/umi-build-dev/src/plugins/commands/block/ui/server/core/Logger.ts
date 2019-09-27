import ora from 'ora';
import { EventEmitter } from 'events';
import MemoryStream from './MemoryStream';

class Logger extends EventEmitter {
  public id: string;
  public spinner: any;
  public log: string = '';
  public ws: MemoryStream = null;

  constructor() {
    super();
    this.ws = new MemoryStream({
      onData: this.onSpinnerData.bind(this),
    });
    this.spinner = ora({
      stream: this.ws,
    });
  }

  public success(info?: string) {
    this.spinner.succeed(info);
  }

  public error(info?: string) {
    this.spinner.fail(info);
  }

  public succeed(info?: string) {
    this.spinner.succeed(info);
  }

  public start(info?: string) {
    this.spinner.start(info);
  }

  public fail(info?: string) {
    this.spinner.fail(info);
  }

  public stopAndPersist(option?) {
    this.spinner.stopAndPersist(option);
  }

  public setId(id: string) {
    this.id = id;
  }

  public clear() {
    this.log = '';
  }

  public getLog() {
    return this.log;
  }

  private onSpinnerData(chunk) {
    const data = chunk.toString();
    this.log = `${this.log}${data}`;
    this.emit('log', {
      data,
    });
  }
}

export default Logger;
