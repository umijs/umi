const ReactDOMServer = require('react-dom/server');
const React = require('react');
const {Readable, Writable} = require('node:stream');

const writable = new Writable({
  write(chunk) {
    this.push(chunk);
  }
});

const stream = ReactDOMServer.renderToPipeableStream(React.createElement('div', null, 'Hello World!'), {
  onShellReady() {
    stream.pipe(writable);
  }
});

const readable = new Readable();
readable.on('')

writable.pipe(readable);

readable.pipe(process.stdout);
