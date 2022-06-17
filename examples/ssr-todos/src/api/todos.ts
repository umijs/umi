import { UmiApiRequest, UmiApiResponse } from 'umi';
import { createTodos, deleteTodo, updateTodo } from '../services/todos';

export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  if (req.method === 'POST') {
    const data = await createTodos(JSON.parse(req.body));
    res.status(200).json({ success: true, data });
  } else if (req.method === 'DELETE') {
    const data = await deleteTodo(JSON.parse(req.body).id);
    res.status(200).json({ success: true, data });
  } else if (req.method === 'PUT') {
    console.log('>> Update', req.query);
    const id = req.query.id as string;
    const data = await updateTodo(id, JSON.parse(req.body));
    res.status(200).json({ success: true, data });
  } else {
    res.status(200).json({ success: false });
  }
}
