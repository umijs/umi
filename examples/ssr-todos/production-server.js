const express = require('express');
const app = express();
const port = 8000;
const todosList = []

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
app.get('/api/todos',function (req, res) {
  res.send({ data: todosList });
})

app.post('/api/todos_add',function (req, res) {
  todosList.push({
      id: new Date().getTime(),
      attributes: {
        title:req.body.title,
        done: false,
        notes: "",
      }
  })
  res.send({ data: todosList });
})

app.post('/api/todos_update',function (req, res) {
  const idx = todosList.findIndex(item => item.id == req.body.id)
  if (idx != -1) todosList[idx].attributes = {...todosList[idx].attributes, ...req.body.data }
  res.send({ data: todosList });
})

app.post('/api/todos_delete',function (req, res) {
  const idx = todosList.findIndex(item => item.id == req.body.id)
  todosList.splice(idx, 1)
  res.send({ data: todosList });
})

// Start server
app.listen(port, () => {
  console.log(`Server is now running at http://127.0.0.1:${port}/`);
});
