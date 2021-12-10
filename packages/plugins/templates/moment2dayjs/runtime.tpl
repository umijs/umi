import dayjs from '{{{dayjsPath}}}';
import antdPlugin from '{{{dayjsAntdPluginPath}}}';

{{#plugins}}
import {{.}} from '{{{dayjsPath}}}/plugin/{{.}}';
{{/plugins}}

{{#plugins}}
dayjs.extend({{.}});
{{/plugins}}

dayjs.extend(antdPlugin);
