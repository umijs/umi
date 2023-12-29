const express = require('express');
const serverHandler = require('./server-handler');
const app = express();
const port = 8000;

app.use(express.json())

// Logger middleware
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});

// Umi SSR middleware
app.use(require(__dirname + '/server/umi.server.js').default);

// Umi static files (including SSG pages)
app.use(express.static('dist'));


// mock server api
app.all("/api/*",serverHandler)


// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
