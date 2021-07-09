import { defineConfig } from 'umi';

export default defineConfig({
  define: {
    MESSAGE: 'hello world form production',
    REACT_APP: process.env.REACT_APP,
  },
});
