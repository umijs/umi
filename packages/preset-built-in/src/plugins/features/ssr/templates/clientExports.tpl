import { IRouteComponentProps } from 'umi'

// only export isBrowser for user
export { isBrowser } from '{{{ SSRUtils }}}';

interface IParams extends Pick<IRouteComponentProps, 'match'> {
  isServer: Boolean;
  [k: string]: any;
}

export type IGetInitialProps<T = any> = (params: IParams) => Promise<T>;
