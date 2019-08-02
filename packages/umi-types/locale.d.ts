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
export declare function setLocale(lang: string, reloadPage?: boolean): void;
export declare function getLocale(): string;
