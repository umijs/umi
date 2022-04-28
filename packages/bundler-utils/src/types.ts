export interface HttpsServerOptions {
  key?: string;
  cert?: string;
  hosts?: string[]; // 默认值 ['localhost', '127.0.0.1']
}
