/**
 * Source: @types/react-intl
 * Changes:
 *   - remove some unnecessary interfaces
 *   - expose interfaces from `IntlShape`
 */
import * as React from 'react';
// Basic types and interfaces
export declare type DateSource = Date | string | number;
export declare type MessageValue = string | number | boolean | Date | null | undefined;
export declare interface DateTimeFormatProps extends Intl.DateTimeFormatOptions {
  format?: string;
}
export interface MessageDescriptor {
  id: string;
  description?: string;
  defaultMessage?: string;
}

// FormattedDate
export declare interface FormattedDateProps extends DateTimeFormatProps {
  value: DateSource;
  children?: (formattedDate: string) => React.ReactNode;
}
export declare class FormattedDate extends React.Component<FormattedDateProps> {}

// FormattedTime
export declare interface FormattedTimeProps extends DateTimeFormatProps {
  value: DateSource;
  children?: (formattedDate: string) => React.ReactNode;
}
export declare class FormattedTime extends React.Component<FormattedTimeProps> {}

// FormattedRelative
export declare interface FormattedRelativeProps {
  units?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  style?: 'best-fit' | 'numeric';
  format?: string;
  updateInterval?: number;
  initialNow?: any;
}
export declare class FormattedRelative extends React.Component<
  FormattedRelativeProps & {
    value: DateSource;
    children?: (formattedRelative: string) => React.ReactNode;
  }
> {}

// FormattedMessage & FormattedHTMLMessage
export interface FormattedMessageProps extends MessageDescriptor {
  values?: { [key: string]: MessageValue | JSX.Element };
  tagName?: string;
  children?: (...formattedMessage: Array<string | JSX.Element>) => React.ReactNode;
}
export class FormattedMessage extends React.Component<FormattedMessageProps> {}
export declare class FormattedHTMLMessage extends React.Component<FormattedMessageProps> {}

// FormattedNumber
export declare interface FormattedNumberProps extends Intl.NumberFormatOptions {
  format?: string;
}
export declare class FormattedNumber extends React.Component<
  FormattedNumberProps & {
    value: number;
    children?: (formattedNumber: string) => React.ReactNode;
  }
> {}

// FormattedPlural
export declare interface FormattedPluralBase {
  style?: 'cardinal' | 'ordinal';
}
export declare interface FormattedPluralProps extends FormattedPluralBase {
  other?: any;
  zero?: any;
  one?: any;
  two?: any;
  few?: any;
  many?: any;
}
export declare class FormattedPlural extends React.Component<
  FormattedPluralProps & {
    value: number;
    children?: (formattedPlural: React.ReactNode) => React.ReactNode;
  }
> {}

// IntlShape
export declare function formatDate(value: DateSource, options?: DateTimeFormatProps): string;
export declare function formatTime(value: DateSource, options?: DateTimeFormatProps): string;
export declare function formatRelative(
  value: DateSource,
  options?: FormattedRelativeProps & { now?: any },
): string;
export declare function formatNumber(value: number, options?: FormattedNumberProps): string;
export declare function formatPlural(
  value: number,
  options?: FormattedPluralBase,
): keyof FormattedPluralProps;
export declare function formatMessage(
  messageDescriptor: MessageDescriptor,
  values?: { [key: string]: MessageValue },
): string;
export declare function formatHTMLMessage(
  messageDescriptor: MessageDescriptor,
  values?: { [key: string]: MessageValue },
): string;
export declare function now(): number;
export declare function onError(error: string): void;

// umi-plugin-locale
export declare function setLocale(lang: string): void;
export declare function getLocale(): string;

// mock umi-plugin-locale
export interface LocaleFileInfo {
  /**
   * short name of language
   * @example
   *   'en' | 'zh'
   */
  lang: string;
  /**
   * name of locale
   * @example
   *   'en-US' | 'zh-CN'
   */
  name: string;
  /**
   * country of current language
   * @example
   *   'US' | 'CN'
   */
  country: string;
  /**
   * paths to your locale files
   * @example
   *   [path.join(RootDirOfYoutProject, './src/locales/en-US.js')]
   * | [path.join(RootDirOfYoutProject, './src/locales/zh-CN.js')]
   */
  paths: string[];
  /**
   * name of moment locale, if the language is English,
   * **do not fill in 'en-us'**, just leave it `undefined` or empty string
   * @example
   *   'zh-cn' | ''
   */
  momentLocale?: string;
}

export interface LocaleMockWrapperOptions {
  /**
   * enable `<LocaleProvider />` of antd
   * @default true
   */
  antd?: boolean;
  /**
   * enable use `navigator.language` overwrite default
   * @default true
   */
  baseNavigator?: boolean;
  /**
   * default locale
   * @default 'zh-CN'
   * @example
   *   'en-US' | 'zh-CN'
   */
  default?: string;
  /**
   * enable mock `localStorage` and `location.reload` to ensure that `setLocale` is available,
   * if `mockGlobalVars` is enabled, it is recommended to unmount component after each test is completed
   * to restore `localStorage` and `location.reload` to prevent its side effects from affecting subsequent tests.
   * @default true
   */
  mockGlobalVars?: boolean;
}

/**
 * @example
 *   import renderer from 'react-test-renderer';
 *   import { getLocaleFileList } from 'umi-plugin-locale'; // or 'umi-plugin-react/locale'
 *   ...
 *   const Wrapper = createMockWrapper(getLocaleFileList(absSrcPath, absPagesPath));
 *   const instance = renderer.create(<Wrapper><MyComponent /></Wrapper>);
 *   ...
 *   instance.unmount();
 */
export declare function createMockWrapper(
  localeFileList: LocaleFileInfo[],
  options?: LocaleMockWrapperOptions,
): React.Component;

/**
 * @param absSrcPath: absolute path to `./src`
 * @param absPagesPath: absolute path to `./src/page(s)`
 * @param singular: enable the directory for singular mode
 *
 * @example
 *   // this is a sample test file located in `./src/pages/__tests__/`
 *   import { winPath } from 'umi-utils';
 *   const absSrcPath = winPath(path.join(__dirname, '../../'));
 *   const absPagesPath = winPath(path.join(__dirname, '../'));
 *   const localeFileList = getLocaleFileList(absSrcPath, absPagesPath);
 */
export declare function getLocaleFileList(
  absSrcPath: string,
  absPagesPath: string,
  singular?: boolean,
): LocaleFileInfo[];
