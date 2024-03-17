import type { Express } from '@umijs/bundler-utils/compiled/express';

export const sseMiddleware = (app: Express) => {
  app.get('/events/number', (req, res) => {
    console.log('new connection');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let counter = 1;
    const intervalId = setInterval(() => {
      if (counter === 5) {
        clearInterval(intervalId);
        res.end(`data: 事件${counter}\n\n`);
        return;
      }
      res.write(`data: 事件${counter}\n\n`);

      counter++;
    }, 1000);

    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  });
};
