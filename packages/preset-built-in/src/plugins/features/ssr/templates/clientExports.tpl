import { IRouteComponentProps } from 'umi'

// only export isBrowser for user
export { isBrowser } from '{{{ SSRUtils }}}';

interface IParams extends Pick<IRouteComponentProps, 'match'> {
  isServer: Boolean;
}

export type IGetInitialProps = (params: IParams) => Promise<any>;
