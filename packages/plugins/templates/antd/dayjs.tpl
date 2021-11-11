import dayjs from '{{{dayjsPath}}}';
import antdPlugin from '{{{dayjsPluginPath}}}/src/antd-plugin';

{{#plugins}}
import {{.}} from '{{{dayjsPath}}}/plugin/{{.}}';
{{/plugins}}

{{#plugins}}
dayjs.extend({{.}});
{{/plugins}}

dayjs.extend(antdPlugin);
