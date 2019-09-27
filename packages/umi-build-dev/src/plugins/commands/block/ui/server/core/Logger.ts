import ora from 'ora';
import MemoryStream from './MemoryStream';

class Logger {
  public id: string;
  public spinner: any;
  public log: string = '';

  constructor() {
    this.spinner = ora({
      stream: new MemoryStream({
        onData: this.onSpinnerData,
      }),
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
    // TODO: 将 spinner 中的数据进行存储
    console.log('--- onSpinnerData ---');
    console.log(chunk.toString());
  }
}

export default Logger;
