const express = require('express');
const cors = require('cors');
const app = express();
const { todoServer } = require('./todo');
const port = 8000;

app.use(cors())
app.use(express.json())

// mock server api
todoServer(app)

// Logger middleware
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});

// Umi SSR middleware
app.use(require(__dirname + '/server/umi.server.js').default);

// Umi static files (including SSG pages)
app.use(express.static('dist'));

// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
