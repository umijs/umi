import { IConfig } from "@umijs/types";

export default {
  routes: [
    { path: "/", component: "index" },
    { path: "/home", component: "index" },
    { path: "/list/:id", component: "index" }
  ],
  ssr:{},
  nodeModulesTransform: {
    type: "none"
  },
  devtool: false,
  exportStatic: {
    htmlSuffix: true,
  },
} as IConfig;
