import * as React from 'react'

type MessageDescriptor = {
  id: string
  defaultMessage: string
  description?: string | object
}

declare function formatMessage(messageDescriptor: MessageDescriptor, values?: object): string

declare function setLocale(lang: string): void

declare function getLocale(): string

type DateTimeFormatOptions = {
  localeMatcher: 'best fit' | 'lookup'
  formatMatcher: 'basic' | 'best fit'

  timeZone: string
  hour12: boolean

  weekday: 'narrow' | 'short' | 'long'
  era: 'narrow' | 'short' | 'long'
  year: 'numeric' | '2-digit'
  month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long'
  day: 'numeric' | '2-digit'
  hour: 'numeric' | '2-digit'
  minute: 'numeric' | '2-digit'
  second: 'numeric' | '2-digit'
  timeZoneName: 'short' | 'long'
}

type FormattedDateProps = DateTimeFormatOptions & {
  value: any
  format?: string
  children?: (formattedDate: string) => React.ReactElement<any>
}

declare class FormattedDate extends React.Component<FormattedDateProps, any> {
  render(): JSX.Element
}

type FormattedTimeProps = DateTimeFormatOptions & {
  value: any
  format?: string
  hour: 'numeric'
  minute: 'numeric'
  children?: (formattedDate: string) => React.ReactElement<any>
}

declare class FormattedTime extends React.Component<FormattedTimeProps, any> {
  render(): JSX.Element
}

type FormattedRelativeProps = {
  style?: 'best fit' | 'numeric'
  units?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year'
} & {
  value: any
  format?: string
  updateInterval?: number
  initialNow?: any
  children?: (formattedDate: string) => React.ReactElement<any>
}

declare class FormattedRelative extends React.Component<FormattedRelativeProps, any> {
  render(): JSX.Element
}

type FormattedNumberOptions = {
  localeMatcher: 'best fit' | 'lookup'

  style: 'decimal' | 'currency' | 'percent'

  currency: string
  currencyDisplay: 'symbol' | 'code' | 'name'

  useGrouping: boolean

  minimumIntegerDigits: number
  minimumFractionDigits: number
  maximumFractionDigits: number
  minimumSignificantDigits: number
  maximumSignificantDigits: number
} & {
  value: any
  format?: string
  children?: (formattedNumber: string) => React.ReactElement<any>
}

declare class FormattedNumber extends React.Component<FormattedNumberOptions, any> {
  render(): JSX.Element
}

type FormattedPluralOptions = {
  style?: 'cardinal' | 'ordinal'
} & {
  value: any

  other: React.ReactElement<any>
  zero?: React.ReactElement<any>
  one?: React.ReactElement<any>
  two?: React.ReactElement<any>
  few?: React.ReactElement<any>
  many?: React.ReactElement<any>

  children?: (formattedPlural: React.ReactElement<any>) => React.ReactElement<any>
}

declare class FormattedPlural extends React.Component<FormattedPluralOptions, any> {
  render(): JSX.Element
}

declare class FormattedMessage extends React.Component<
  MessageDescriptor & {
    values?: object
    tagName?: string
    children?: (...formattedMessage: Array<React.ReactElement<any>>) => React.ReactElement<any>
  },
  any
> {
  render(): JSX.Element
}

export { formatMessage }
export { setLocale }
export { getLocale }
export { FormattedDate }
export { FormattedTime }
export { FormattedRelative }
export { FormattedNumber }
export { FormattedPlural }
export { FormattedMessage }
