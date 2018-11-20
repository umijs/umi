import React from 'react';
{{#useLocale}}
import { formatMessage } from 'umi/locale';
{{/useLocale}}

export default class UmiReactTitle extends React.Component {
  componentDidMount() {
    {{#useLocale}}
    document.title = formatMessage({
      id: this.props.route._title,
      defaultMessage: this.props.route._title
    });
    {{/useLocale}}
    {{^useLocale}}
    document.title = this.props.route._title;
    {{/useLocale}}
  }
  componentWillUnmount() {
    {{#useLocale}}
    if (
      document.title ===
      formatMessage({
        id: this.props.route._title,
        defaultMessage: this.props.route._title
      })
    ) {
      document.title = this.props.route._title
    }
    {{/useLocale}}
    {{^useLocale}}
    if (document.title === this.props.route._title) {
      document.title = this.props.route._title;
    }
    {{/useLocale}}
  }
  render() {
    return this.props.children;
  }
}
