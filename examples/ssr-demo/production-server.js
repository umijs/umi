const express = require('express');
const app = express();
const port = 3000;

app.use(async (req, res, next) => {
  if (req.path.match(/([0-9]+|umi)\.js/)) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  next();
})

// Logger middleware
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});

// Umi SSR middleware
app.use(require(__dirname + '/umi.server.js').default);

// Umi static files (including SSG pages)
app.use(express.static('dist'));

// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
