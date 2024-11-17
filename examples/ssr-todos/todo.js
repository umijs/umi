
const todoList = [
  {
    done: false,
    id: 0,
    title: 'Todo 1',
  }
];

/**
 * @param {import('express').Express} app
 */
function todoServer(app) {
  const useGET = (path, handler) => {
    app.get(path, handler);
  }
  const usePOST = (path, handler) => {
    app.post(path, handler)
  }

  useGET('/api/todo/list', (req, res) => {
    res.json({ data: todoList, code: 0 })
  })

  usePOST('/api/todo/add', (req, res) => {
    const { title } = req.body
    const target = {
      id: Date.now(),
      title: title || '',
      done: false,
    }
    todoList.push(target);
    res.json({ data: target, code: 0 })
  })

  usePOST('/api/todo/update', (req, res) => {
    const { id, title, done } = req.body;
    const targetIdx = todoList.findIndex((item) => item.id == id);
    if (~targetIdx) {
      const target = todoList[targetIdx];
      const newTarget = {
        ...target,
        ...(title === undefined ? {} : { title }),
        ...(done === undefined ? {} : { done }),
      }
      todoList[targetIdx] = newTarget;
      res.json({ data: target, code: 0 })
    } else {
      res.json({ data: null, code: -1, message: 'Not found' })
    }
  })

  usePOST('/api/todo/delete', (req, res) => {
    const { id } = req.body;
    const idx = todoList.findIndex((item) => item.id == id);
    if (~idx) {
      todoList.splice(idx, 1);
      res.json({ data: null, code: 0 })
    } else {
      res.json({ data: null, code: -1, message: 'Not found' })
    }
  })
}

module.exports = {
  todoServer,
}
