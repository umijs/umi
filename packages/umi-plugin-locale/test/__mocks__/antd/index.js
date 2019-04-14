export const LocaleProvider = props => {
  localStorage.setItem('antd-locale-loaded', 'true');
  return props.children;
};
