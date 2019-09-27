import ora from 'ora';
import MemoryStream from './MemoryStream';

class Logger {
  public id: string;
  public spinner: any;
  public log: string = '';
  public ws: MemoryStream = null;

  constructor() {
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

  public appendLog(log) {
    const data = Buffer.isBuffer(log) ? log.toString() : log;
    this.log = `${this.log}${data}`;
  }

  private onSpinnerData(chunk) {
    this.log = `${this.log}${chunk.toString()}`;
  }
}

export default Logger;
