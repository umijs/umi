import React, { Component } from '{{reactPath}}';
{{#blocks}}
import {{blockName}} from './{{blockPath}}'
{{/blocks}}

export default class {{blockEntryName}} extends Component {
  render() {
    return (
      <React.Fragment>
        {{#blocks}}
        <{{blockName}} />
        {{/blocks}}
        {/* Keep this comment and new blocks will be added above it */}
      </React.Fragment>
  	)
  }
}