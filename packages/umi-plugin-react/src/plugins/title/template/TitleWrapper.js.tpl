import React from 'react';
{{#useLocale}}
import { formatMessage } from 'umi-plugin-locale';
{{/useLocale}}

export default class UmiReactTitle extends React.Component {
  componentDidMount() {
    {{#useLocale}}
    document.title = this.getTitle();
    {{/useLocale}}
    {{^useLocale}}
    document.title = this.props.route._title;
    {{/useLocale}}
  }
  getTitle() {
    const separator = '{{option.separator}}' || ' - ';
    const title = this.props.route._title.split(separator).map(item => {
      return formatMessage({
        id: item.trim(),
        defaultMessage: item.trim(),
      });
    })
    return title.join(separator);
  }
  componentWillUnmount() {
    {{#useLocale}}
    if (
      document.title === this.getTitle()
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
