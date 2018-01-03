declare const dynamic: (resolve: (value?: PromiseLike<any>) => void, opts?: {
  /** LoadingComponent */
  loading?: Function,
  /** The callback of load script */
  callback?: (err?: Error) => void,
}) => void;
export default dynamic;
