declare const dynamic: (resolve: (value?: PromiseLike<any>) => void, opts?: {
  /** LoadingComponent */
  loading?: Function,
  /** The hoc for resolved component */
  hoc?: Function,
}) => void;
export default dynamic;
