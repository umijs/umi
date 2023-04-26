export const PluginContainer = (props: { url: string; name: string }) => {
  return <iframe style={{ width: '100%', height: '100%' }} src={props.url} />;
};
