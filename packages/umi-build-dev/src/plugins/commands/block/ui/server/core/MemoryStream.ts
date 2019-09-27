import { Writable } from 'stream';

class MemoryStream extends Writable {
  public onData;

  constructor(options) {
    const { onData, ...rest } = options;
    super(rest);
    this.onData = onData;
  }

  _write(chunk, _, cb) {
    this.onData(chunk);
    cb();
  }
}

export default MemoryStream;
