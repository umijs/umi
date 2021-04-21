export const ssr = {
  modifyServerHTML: async (html: string) => {
    return html.replace('</head>', '<script>alert(123);</script></head>');
  },
};
