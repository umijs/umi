class RecordChunksMap {
  constructor() {
    this.chunks = '';
  }

  apply(compiler) {
    const ID = `umi-record-chunks`;
    compiler.hooks.emit.tap(ID, compilation => {
      this.chunks = compilation.chunks;
    });
  }
}

export default RecordChunksMap;
