export default function(api: any) {
  ['onGenerateFiles'].forEach(name => {
    api.registerMethod({ name });
  });
}
