import { IRouteComponentProps } from 'umi'

// using in client
export const isBrowser = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

interface IParams extends Pick<IRouteComponentProps, 'match'> {
  isServer: Boolean;
}

export type IGetInitialProps = (params: IParams) => Promise<any>;
