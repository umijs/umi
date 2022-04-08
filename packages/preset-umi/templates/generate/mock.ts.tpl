export default {
  'GET /api/{{{mockName}}}': (_req: any, res: any) => {
    res.json({
      success: true,
      data: {},
      errorCode: 0,
    });
  },
};
