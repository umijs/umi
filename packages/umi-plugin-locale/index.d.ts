import * as React from 'react';
declare function setLocale(lang: string): void;
declare function getLocale(): string;
interface Params {
  id: string;
  defaultMessage?: string;
}
declare function formatMessage(params: Params, data?: Object): void;
declare class FormattedMessage extends React.Component<Params> { }

export { setLocale, getLocale, formatMessage, FormattedMessage };
