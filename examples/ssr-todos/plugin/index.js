
/**
 * 使用umi中间件免去启动额外的服务
 */
const express = require('express');
module.exports = function (api) {
  const todosList = []
  api.addMiddlewares(() => {
    return [
      express.json(),
      (req, res, next) => {
        if (req.path == "/api/todos") res.send({ data: todosList });
        if (req.path == "/api/todos_add") {
          todosList.push({
            id: new Date().getTime(),
            attributes: {
              title: req.body.title,
              done: false,
              notes: "",
            }
          })
          res.send({ data: todosList });
        }

        if (req.path == "/api/todos_update") {
          const idx = todosList.findIndex(item => item.id == req.body.id)
          if (idx != -1) todosList[idx].attributes = {...todosList[idx].attributes, ...req.body.data }
          res.send({ data: todosList });
        }

        if (req.path == "/api/todos_delete") {
          const idx = todosList.findIndex(item => item.id == req.body.id)
          todosList.splice(idx, 1)
          res.send({ data: todosList });
        }
        next();
      }
    ]
  });

}