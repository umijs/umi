
const todosList = [];
module.exports = function (req, res, next) {
  const timestamp = new Date().getTime().toString()

  if (req.path == '/api/todos') res.status(200).json({ data: todosList, success: true, t: timestamp });
  if (req.path == '/api/todos_add') {
    todosList.push({
      id: timestamp,
      attributes: {
        title: req.body.title,
        done: false,
        notes: '',
      },
    });
    res.status(200).json({ data: todosList, success: true });
  }

  if (req.path == '/api/todos_update') {
    const idx = todosList.findIndex((item) => item.id == req.body.id);
    if (idx != -1)
      todosList[idx].attributes = {
        ...todosList[idx].attributes,
        ...req.body.data,
      };
    res.status(200).json({ data: todosList, success: true });
  }

  if (req.path == '/api/todos_delete') {
    const idx = todosList.findIndex((item) => item.id == req.body.id);
    todosList.splice(idx, 1);
    res.status(200).json({ data: todosList, success: true });
  }
  next();
};
