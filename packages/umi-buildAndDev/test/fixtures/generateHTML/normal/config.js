export default {
  pages: {
    '/a.html': { query: { title: 'a' } },
    '/b.html': { query: {} },
    '/c.html': { query: { title: 'b' }, document: './page/_document_c.ejs' },
  },
};
