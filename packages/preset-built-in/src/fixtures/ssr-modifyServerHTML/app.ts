export const ssr = {
  modifyServerHTML: async (html) => {
    return html.replace('</head>', '<script>alert(123);</script></head>')
  }
}
