import { IntlProvider } from 'react-intl';

export default props => {
  return (
    <IntlProvider locale="en">
      <div>
        <h1>Layout</h1>
        {props.children}
      </div>
    </IntlProvider>
  );
};
