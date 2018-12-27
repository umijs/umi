declare function setLocale(lang: string): void;
declare function getLocale(): string;
interface Params {
  id: string;
  defaultMessage?: string;
}
declare function formatMessage(params: Params, data?: Object): void;
declare const FormattedMessage: React.Component;

export { setLocale, getLocale, formatMessage, FormattedMessage };
