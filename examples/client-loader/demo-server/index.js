const express = require('express');
const app = express();

// Logger middleware
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url}`);
  next();
});


app.use(async (req, res, next) => {

  if (req.url.startsWith('/api/mock')) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    res.json({
      message: 'data from client loader of ' + req.query.file
    });
    return;
  }

  if (req.path.match(/\.js/)) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  next();
})

// static files
app.use(express.static('dist'));

const port = 3000;

// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
