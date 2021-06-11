import { Request, Response } from 'express';

export default {
  'POST /api/hello': {
    text: 'Alita',
  },
  'POST /api/list': (req: Request, res: Response) => {
    const dataSource = [
      {
        id: 1,
        title: 'Ant Design Title 1',
      },
      {
        id: 2,
        title: 'Ant Design Title 2',
      },
      {
        id: 3,
        title: 'Ant Design Title 3',
      },
      {
        id: 4,
        title: 'Ant Design Title 4',
      },
      {
        id: 5,
        title: 'Ant Design Title 5',
      },
      {
        id: 6,
        title: 'Ant Design Title 6',
      },
      {
        id: 7,
        title: 'Ant Design Title 7',
      },
      {
        id: 8,
        title: 'Ant Design Title 8',
      },
      {
        id: 9,
        title: 'Ant Design Title 9',
      },
      {
        id: 10,
        title: 'Ant Design Title 10',
      },
      {
        id: 11,
        title: 'Ant Design Title 11',
      },
      {
        id: 12,
        title: 'Ant Design Title 12',
      },
      {
        id: 13,
        title: 'Ant Design Title 13',
      },
      {
        id: 14,
        title: 'Ant Design Title 14',
      },
      {
        id: 15,
        title: 'Ant Design Title 15',
      },
      {
        id: 16,
        title: 'Ant Design Title 16',
      },
      {
        id: 17,
        title: 'Ant Design Title 17',
      },
      {
        id: 18,
        title: 'Ant Design Title 18',
      },
      {
        id: 19,
        title: 'Ant Design Title 19',
      },
      {
        id: 20,
        title: 'Ant Design Title 20',
      },
    ];
    const { body } = req;

    const { pageSize, offset } = body;
    return res.json({
      total: dataSource.length,
      data: dataSource.slice(offset, offset + pageSize),
    });
  },
};
