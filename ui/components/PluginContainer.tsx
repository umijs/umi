export const PluginContainer = (props: { url: string; name: string }) => {
  return (
    <iframe
      style={{ width: '100%', height: '100%', border: 0 }}
      src={props.url}
    />
  );
};
