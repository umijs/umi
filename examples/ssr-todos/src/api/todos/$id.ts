import { UmiApiRequest, UmiApiResponse } from 'umi';
import { updateTodo } from '../../services/todos';

export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  if (req.method === 'PUT') {
    console.log('>> Update', req.params);
    const id = req.params.id;
    const data = await updateTodo(id, JSON.parse(req.body));
    res.status(200).json({ success: true, data });
  }
}
